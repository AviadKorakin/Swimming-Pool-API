import {DayOfWeek, IInstructor, Instructor, WeeklyAvailability} from '../models/instructor';
import {AppError} from "../errors/AppError";
import {Lesson} from "../models/lesson";
import {LessonRequest} from "../models/LessonRequest";
import mongoose from "mongoose";

class InstructorService {
    // Add a new instructor with overlap validation
    async addInstructor(instructorData: Omit<IInstructor,'_id'>): Promise<IInstructor> {
        if (instructorData.availableHours) {
            instructorData.availableHours = this.sortAvailableHours(instructorData.availableHours);
            this.validateAvailableHours(instructorData.availableHours);
        }

        // Ensure the name is unique
        instructorData.name = await this.generateUniqueName(instructorData.name);

        const instructor = new Instructor(instructorData);
        return await instructor.save();
    }

    // Update instructor details with overlap validation
    async updateInstructor(
        instructorId: string,
        updatedData: Partial<Omit<IInstructor,'_id'>>
    ): Promise<IInstructor | null> {
        if (updatedData.availableHours) {
            updatedData.availableHours = this.sortAvailableHours(updatedData.availableHours);
            this.validateAvailableHours(updatedData.availableHours);
        }

        return Instructor.findByIdAndUpdate(instructorId, updatedData, { new: true });
    }

    // Rearrange availableHours by sorting them by day and start time
    private sortAvailableHours(availableHours: { day: DayOfWeek; start: string; end: string }[]) {
        const dayOrder: Record<DayOfWeek, number> = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
        };

        return availableHours.sort((a, b) => {
            // Sort by day first using the predefined dayOrder
            if (dayOrder[a.day] !== dayOrder[b.day]) {
                return dayOrder[a.day] - dayOrder[b.day];
            }

            // Sort by start time if the days are the same
            return a.start.localeCompare(b.start);
        });
    }

    // Validate availableHours for overlapping ranges
    private validateAvailableHours(availableHours: { day: DayOfWeek; start: string; end: string }[]) {
        // Group by day
        const hoursByDay: Record<DayOfWeek, { start: string; end: string }[]> = availableHours.reduce(
            (acc, { day, start, end }) => {
                if (!acc[day]) acc[day] = [];
                acc[day].push({ start, end });
                return acc;
            },
            {} as Record<DayOfWeek, { start: string; end: string }[]>
        );

        // Check for overlaps and validate start and end times within each day
        for (const [day, hours] of Object.entries(hoursByDay) as [DayOfWeek, { start: string; end: string }[]][]) {
            hours.sort((a, b) => a.start.localeCompare(b.start)); // Sort by start time

            for (let i = 0; i < hours.length; i++) {
                const current = hours[i];

                // Validate that the start time is less than the end time
                if (current.start >= current.end) {
                    throw new AppError(
                        `Invalid time range on ${day}: Start time (${current.start}) must be earlier than end time (${current.end}).`,
                        400
                    );
                }

                // Validate overlap with the next time range
                if (i < hours.length - 1) {
                    const next = hours[i + 1];
                    if (current.end > next.start) {
                        throw new AppError(
                            `Overlapping time ranges found on ${day}: ${current.start}-${current.end} overlaps with ${next.start}-${next.end}.`,
                            409
                        );
                    }
                }
            }
        }
    }




    // Generate a unique name
    private async generateUniqueName(baseName: string): Promise<string> {
        let uniqueName = baseName;
        let count = 1;

        while (await Instructor.exists({ name: uniqueName })) {
            uniqueName = `${baseName}(${count})`;
            count++;
        }

        return uniqueName;
    }

    // Remove an instructor
    async removeInstructor(instructorId: string): Promise<boolean> {
        const result = await Instructor.findByIdAndDelete(instructorId);
        return result !== null;
    }

    // Get all instructors (with optional pagination)
    async getAllInstructors(
        page: number = 1,
        limit: number = 10
    ): Promise<{ instructors: IInstructor[]; total: number }> {
        const total = await Instructor.countDocuments();
        const instructors = await Instructor.find()
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { instructors, total };
    }

    // Get instructor by ID
    async getInstructorById(instructorId: string): Promise<IInstructor | null> {
        return Instructor.findById(instructorId);
    }

    // Find available instructors for specific time and styles
    async findAvailableInstructors(day: string, time: string, styles: string[]): Promise<IInstructor[]> {
        return Instructor.find({
            availableHours: {
                $elemMatch: {
                    day: day,
                    start: { $lte: time },
                    end: { $gte: time },
                },
            },
            expertise: { $all: styles }, // Match all styles in the array
        });
    }

    // Get working days for an instructor
    async getInstructorWorkingDays(instructorId: string): Promise<DayOfWeek[]> {
        const instructor = await this.getInstructorById(instructorId);

        if (!instructor) {
            throw new AppError('Instructor not found', 404);
        }

        // Extract unique days from the availableHours array
        return Array.from(
            new Set(instructor.availableHours.map((day) => day.day))
        );
    }

    async getAvailableHoursForInstructor(instructorId: string, date: Date): Promise<{ start: string; end: string }[]> {
        // Fetch instructor details
        const instructor = await instructorService.getInstructorById(instructorId);
        if (!instructor) {
            throw new AppError("Instructor not found", 404);
        }
        // Convert the date to the corresponding day of the week
        const dayOfWeek: DayOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ][date.getDay()] as DayOfWeek;

        // Fetch working hours for the instructor on the specified day
        const workingHours = instructor.availableHours.filter((hour) => hour.day === dayOfWeek);

        if (workingHours.length === 0) {
            return []; // No working hours for the specified day
        }

        // Fetch lessons for the instructor on the specified date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const lessons = await Lesson.find({
            startTime: { $gte: startOfDay, $lte: endOfDay },
        });

        // Calculate available time slots
        const bookedSlots = lessons.map((lesson) => ({
            start: lesson.startTime.toISOString().slice(11, 16), // Extract HH:mm format
            end: lesson.endTime.toISOString().slice(11, 16),
        }));

        const availableSlots: { start: string; end: string }[] = [];

        workingHours.forEach(({ start, end }) => {
            let currentStart = start;

            // Iterate over booked slots and calculate gaps
            bookedSlots
                .filter((slot) => slot.start >= start && slot.end <= end) // Slots within the working hours
                .sort((a, b) => a.start.localeCompare(b.start)) // Sort by start time
                .forEach((slot) => {
                    if (currentStart < slot.start) {
                        availableSlots.push({ start: currentStart, end: slot.start });
                    }
                    currentStart = slot.end; // Move current start to the end of the booked slot
                });

            // Add the last slot after the final booked slot
            if (currentStart < end) {
                availableSlots.push({ start: currentStart, end });
            }
        });

        return availableSlots;
    }

    // Validate instructor for a specific lesson
    async validateInstructorForLesson(
        instructorId: string,
        style: string
    ): Promise<void> {
        const instructor = await this.getInstructorById(instructorId);
        if (!instructor) {
            throw new AppError('Instructor does not exist', 404);
        }

        // Ensure the instructor has expertise in the requested style
        if (!instructor.expertise.includes(style)) {
            throw new AppError(
                `Instructor does not have expertise in the selected style: ${style}`,
                400
            );
        }
    }

    async getWeeklyAvailableHours(
        date: Date,
        styles: string[],
        instructorIds?: string[]
    ): Promise<WeeklyAvailability[]> {

        // Get the current date and move to the start of the next week (Sunday)
        const now = new Date();
        const nextWeekStart = new Date(now);
        nextWeekStart.setDate(now.getDate() + (7 - now.getDay())); // Move to next week's Sunday
        nextWeekStart.setHours(0, 0, 0, 0);

        console.log("Next week's start date:", nextWeekStart);

        // Validate if the date is at least the start of the next week
        if (date < nextWeekStart) {
            const errorMessage = `Invalid date: The provided date must be at least the start of the next week (${nextWeekStart.toISOString().slice(0, 10)}).`;
            console.error(errorMessage);
            throw new AppError(errorMessage, 400);
        }

        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Move to Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        console.log("Start of the week:", startOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        console.log("End of the week:", endOfWeek);

        // Fetch all instructors or filter by instructorIds if provided
        const instructorQuery = instructorIds && instructorIds.length > 0
            ? { _id: { $in: instructorIds } }
            : {}; // Fetch all instructors if instructorIds are not provided
        const instructors = await Instructor.find(instructorQuery).exec();

        // Fetch all lessons for the week in one query
        const [lessons, lessonRequests] = await Promise.all([
            Lesson.find({
                instructor: { $in: instructorIds },
                startTime: { $gte: startOfWeek, $lte: endOfWeek },
            }).exec(),
            LessonRequest.find({
                instructor: { $in: instructorIds },
                startTime: { $gte: startOfWeek, $lte: endOfWeek },
                status: "pending", // Only consider pending requests
            }).exec(),
        ]);
        console.log("Fetched lessons:", lessons);

        // Group lessons by instructor and day of the week
        const allScheduledSlots: Record<
            string,
            Record<string, { start: string; end: string }[]>
        > = {};

        const processSchedule = (schedule: { instructor: mongoose.Types.ObjectId; startTime: Date; endTime: Date }[]) => {
            schedule.forEach((item) => {
                const instructorId = item.instructor.toString();
                const scheduleDate = new Date(item.startTime).toISOString().slice(0, 10);

                if (!allScheduledSlots[instructorId]) {
                    allScheduledSlots[instructorId] = {};
                }

                if (!allScheduledSlots[instructorId][scheduleDate]) {
                    allScheduledSlots[instructorId][scheduleDate] = [];
                }

                allScheduledSlots[instructorId][scheduleDate].push({
                    start: item.startTime.toISOString().slice(11, 16),
                    end: item.endTime.toISOString().slice(11, 16),
                });
            });
        };

        processSchedule(lessons);
        processSchedule(lessonRequests);

        // Prepare the result array
        const result: WeeklyAvailability[] = [];

        // Process each instructor
        for (const instructor of instructors) {
            console.log("Processing instructor:", instructor);

            // Check if the instructor has expertise in any of the provided styles
            const hasExpertise = styles.some((style) => instructor.expertise.includes(style));
            if (!hasExpertise) {
                console.log(`Instructor ${instructor._id} does not have expertise in provided styles.`);
                result.push({
                    instructorId: instructor._id.toString(),
                    instructorName: instructor.name,
                    weeklyHours: [],
                });
                continue;
            }

            const weeklyHours: {
                day: DayOfWeek;
                availableHours: { start: string; end: string }[];
            }[] = [];

            // Iterate through each day of the week
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(startOfWeek);
                currentDay.setDate(startOfWeek.getDate() + i);

                const dayOfWeek: DayOfWeek = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ][i] as DayOfWeek;

                const workingHours = instructor.availableHours.filter((hour) => hour.day === dayOfWeek);

                if (workingHours.length === 0) {
                    continue;
                }

                const dayLessons =
                    allScheduledSlots[instructor._id.toString()]?.[currentDay.toISOString().slice(0, 10)] || [];

                const availableHours: { start: string; end: string }[] = [];

                workingHours.forEach(({ start, end }) => {
                    let currentStart = start;

                    dayLessons
                        .filter((slot) => slot.start >= start && slot.end <= end)
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .forEach((slot) => {
                            if (currentStart < slot.start) {
                                availableHours.push({ start: currentStart, end: slot.start });
                            }
                            currentStart = slot.end;
                        });

                    if (currentStart < end) {
                        availableHours.push({ start: currentStart, end });
                    }
                });

                weeklyHours.push({ day: dayOfWeek, availableHours });
            }


            result.push({
                instructorId: instructor._id.toString(),
                instructorName: instructor.name,
                weeklyHours,
            });
        }

        return result;
    }





}

export const instructorService = new InstructorService();