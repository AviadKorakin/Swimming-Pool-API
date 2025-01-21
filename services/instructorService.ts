import {DayOfWeek, IInstructor, Instructor} from '../models/instructor';
import {AppError} from "../errors/AppError";
import {Lesson} from "../models/lesson";

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

}

export const instructorService = new InstructorService();