import {
    ILesson,
    ILessonWithFlags,
    ILessonWithStudentFlags,
    Lesson,
    LessonFilter,
    WeeklyLessonData,
    WeeklyStudentLessonData
} from '../models/lesson';
import mongoose from 'mongoose';
import {AppError} from "../errors/AppError";
import {instructorService} from "./instructorService";
import {DayOfWeek } from "../models/instructor";
import {studentService} from "./studentService";
import {IStudent} from "../models/student";

class LessonService {
    // Add a new lesson
    async addLesson(lessonData: Omit<ILesson, '_id'>): Promise<ILesson> {
        try {
            // Ensure start and end times are in the future
            this.validateLessonDates(lessonData.startTime, lessonData.endTime);
        } catch (error) {
            console.error('Error in validateLessonDates:', error);
            throw error; // Re-throw after logging
        }

        try {
            // Check lesson participants match the lesson
            await this.validateLessonParticipants(
                lessonData.instructor,
                lessonData.students,
                lessonData.style,
                lessonData.type
            );
        } catch (error) {
            console.error('Error in validateLessonParticipants:', error);
            throw error; // Re-throw after logging
        }

        try {
            // Validate the lesson fits within the instructor's available hours
            await this.validateInstructorAvailability(
                lessonData.instructor,
                lessonData.startTime,
                lessonData.endTime
            );
        } catch (error) {
            console.error('Error in validateInstructorAvailability:', error);
            throw error; // Re-throw after logging
        }

        try {
            // Validate no overlaps in the pool lessons schedule
            await this.validateLessonOverlap(
                lessonData.startTime,
                lessonData.endTime
            );
        } catch (error) {
            console.error('Error in validateLessonOverlap:', error);
            throw error; // Re-throw after logging
        }

        const lesson = new Lesson(lessonData);
        return await lesson.save();
    }
    // Update an existing lesson
    // async updateLesson(
    //     lessonId: string,
    //     updatedData: Partial<ILesson>
    // ): Promise<ILesson | null> {
    //     // Fetch the existing lesson
    //     const existingLesson = await Lesson.findById(lessonId).lean();
    //     if (!existingLesson) {
    //         throw new AppError('Lesson not found', 404);
    //     }
    //
    //     // Merge existing data with updates
    //     const mergedLessonData: ILesson = {
    //         ...existingLesson.toObject(),
    //         ...updatedData,
    //     };
    //
    //     // Ensure start and end times are valid
    //     const startTime = mergedLessonData.startTime;
    //     const endTime = mergedLessonData.endTime;
    //
    //     this.validateLessonDates(startTime, endTime);
    //
    //     // Validate instructor and students if related fields are being updated
    //     const instructorChanged = updatedData.instructor !== undefined;
    //     const studentsChanged = updatedData.students !== undefined;
    //     const styleChanged = updatedData.style !== undefined;
    //     const typeChanged = updatedData.type !== undefined;
    //
    //     if (instructorChanged || studentsChanged || styleChanged || typeChanged) {
    //         await this.validateLessonParticipants(
    //             mergedLessonData.instructor,
    //             mergedLessonData.students,
    //             mergedLessonData.style,
    //             mergedLessonData.type
    //         );
    //     }
    //
    //     // Validate the lesson fits within the instructor's available hours if time or instructor changes
    //     if (instructorChanged || startTime !== existingLesson.startTime || endTime !== existingLesson.endTime) {
    //         await this.validateInstructorAvailability(
    //             mergedLessonData.instructor,
    //             startTime,
    //             endTime
    //         );
    //     }
    //
    //     // Validate no overlaps in the schedule
    //     await this.validateLessonOverlap(
    //         startTime,
    //         endTime,
    //         lessonId // Exclude the current lesson
    //     );
    //
    //     // Update the lesson in the database
    //     return Lesson.findByIdAndUpdate(lessonId, updatedData, { new: true });
    // }
    // Update an existing lesson
    async updateLesson(
        lessonId: string,
        updatedData: Partial<ILesson>
    ): Promise<ILesson | null> {
        // Fetch the existing lesson
        const existingLesson = await Lesson.findById(lessonId).lean();
        if (!existingLesson) {
            throw new AppError('Lesson not found', 404);
        }

        // Merge existing data with updates
        const mergedLessonData: ILesson = {
            ...existingLesson,
            ...updatedData,
        };

        // Extract updated fields for validation
        const { startTime, endTime, instructor, students, style, type } = mergedLessonData;

        // Use Promise.all to validate concurrently
        const validationTasks: Promise<void>[] = [];

        this.validateLessonDates(startTime, endTime);

        // Validate instructor, students, style, and type if they were updated
        if (
            updatedData.instructor !== undefined ||
            updatedData.students !== undefined ||
            updatedData.style !== undefined ||
            updatedData.type !== undefined
        ) {
            validationTasks.push(
                this.validateLessonParticipants(instructor, students, style, type)
            );
        }

        // Validate the lesson's time availability for the instructor
        if (
            updatedData.instructor !== undefined ||
            updatedData.startTime !== undefined ||
            updatedData.endTime !== undefined
        ) {
            validationTasks.push(
                this.validateInstructorAvailability(instructor, startTime, endTime)
            );
        }

        // Validate no overlaps with other lessons
        validationTasks.push(
            this.validateLessonOverlap(startTime, endTime, lessonId)
        );

        // Execute all validation tasks concurrently
        await Promise.all(validationTasks);

        // Update the lesson in the database
        return Lesson.findByIdAndUpdate(lessonId, updatedData, { new: true });
    }


    // Remove a lesson
    async removeLesson(lessonId: string): Promise<boolean> {
        const deletedLesson = await Lesson.findByIdAndDelete(lessonId);
        return !!deletedLesson;
    }

    // Get all lessons (optional filters like instructor, type, etc.)
    async getAllLessons(
        filters: LessonFilter = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ lessons: ILesson[]; total: number }> {
        const queryFilters: Record<string, any> = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );

        const total = await Lesson.countDocuments(queryFilters);
        const lessons = await Lesson.find(queryFilters)
            .populate('instructor students')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return {lessons, total};
    }

    // Validate start and end times
    public validateLessonDates(startTime: Date, endTime: Date): void {
        const currentTime = new Date();

        if (startTime <= currentTime) {
            throw new AppError('Start time must be in the future', 400);
        }

        if (endTime <= startTime) {
            throw new AppError('End time must be after the start time', 400);
        }
    }

    // Validate that a lesson does not overlap with existing lessons for the same instructor
    private async validateLessonOverlap(
        startTime: Date,
        endTime: Date,
        excludeLessonId?: string
    ): Promise<void> {
        const overlappingLessons = await Lesson.find({
            _id: {$ne: excludeLessonId}, // Exclude current lesson if updating
            $or: [
                {
                    startTime: {$lt: endTime, $gte: startTime},
                },
                {
                    endTime: {$gt: startTime, $lte: endTime},
                },
                {
                    startTime: {$lte: startTime},
                    endTime: {$gte: endTime},
                },
            ],
        });

        if (overlappingLessons.length > 0) {
            throw new AppError(
                'Lesson times overlap with another lesson.', 409
            );
        }
    }

    async getWeeklyLessons(
        date: Date,
        instructorId?: string,
        sort: boolean = false
    ): Promise<WeeklyLessonData> {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Move to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        const query: Record<string, any> = {
            startTime: {$gte: startOfWeek, $lte: endOfWeek},
        };

        if (sort && instructorId) {
            query.instructor = instructorId;
        }
        const [lessons, instructorWorkingDays]: [ILesson[], DayOfWeek[]] = await Promise.all([
            Lesson.find(query).populate('instructor students').exec(),
            instructorId
                ? instructorService.getInstructorWorkingDays(instructorId)
                : Promise.resolve([]), // Explicitly use Promise.resolve([]) for consistent typing
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayNames: DayOfWeek[] = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        const groupedLessons: WeeklyLessonData = dayNames.reduce((acc, day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index); // Calculate the exact date for each day

            acc[day] = {
                date: dayDate,
                editable: dayDate > today && instructorWorkingDays.includes(day),
                lessons: [],
            };
            return acc;
        }, {} as WeeklyLessonData);

        lessons.forEach((lesson) => {
            const lessonDay = new Date(lesson.startTime).getDay();
            const currentDayName = dayNames[lessonDay];

            const isLessonInFuture = lesson.startTime > today;
            const isInstructorLesson = lesson.instructor._id.toString() === instructorId;

            const lessonWithFlags: ILessonWithFlags = {
                ...lesson.toObject(),
                editable: isLessonInFuture && isInstructorLesson,
                deletable: isLessonInFuture && isInstructorLesson,
            };

            const dayIndex = dayNames.indexOf(currentDayName);
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + dayIndex);

            groupedLessons[currentDayName] = {
                date: dayDate,
                editable: dayDate > today && instructorWorkingDays.includes(currentDayName),
                lessons: [...groupedLessons[currentDayName].lessons, lessonWithFlags],
            };
        });

        return groupedLessons;
    }

    async getStudentWeeklyLessons(
        date: Date,
        studentId: string,
        instructorIds?: string[]
    ): Promise<WeeklyStudentLessonData> {
        const student = await studentService.getStudentById(studentId);
        if (!student) {
            throw new AppError("Student not found", 404);
        }

        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Move to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        const query: Record<string, any> = {
            startTime: {$gte: startOfWeek, $lte: endOfWeek},
            type: (student.lessonPreference === "both_prefer_group" || student.lessonPreference === "both_prefer_private")
                ? {$in: ["private", "group"]}
                : student.lessonPreference, // Match the student's lesson preference
            style: {$in: student.preferredStyles}, // Match the student's preferred styles
        };

        if (instructorIds && instructorIds.length > 0) {
            query.instructor = {$in: instructorIds}; // Match any of the provided instructor IDs
        }

        const lessons = await Lesson.find(query).populate("instructor students").exec();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayNames: DayOfWeek[] = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        const groupedLessons: WeeklyStudentLessonData = dayNames.reduce((acc, day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index); // Calculate the exact date for each day

            acc[day] = {
                date: dayDate,
                lessons: [],
            };
            return acc;
        }, {} as WeeklyStudentLessonData);

        const nextWeekStart = new Date(today); // Start of next week
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay())); // Move to next week's Sunday
        nextWeekStart.setHours(0, 0, 0, 0);

        const nextWeekEnd = new Date(nextWeekStart); // End of next week
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Next week's Saturday
        nextWeekEnd.setHours(23, 59, 59, 999);

        const cancelableThreshold = new Date(today); // 2 days from today
        cancelableThreshold.setDate(today.getDate() + 2);
        cancelableThreshold.setHours(0, 0, 0, 0);


        lessons.forEach((lesson) => {
            const lessonDay = new Date(lesson.startTime).getDay();
            const currentDayName = dayNames[lessonDay];
            let assignable = false;
            let cancelable: boolean;
            const isAssigned = this.isAssignedToLesson(student, lesson);
            try {
                // Validate if the student can be assigned to this lesson
                if (!isAssigned) {
                    this.validateAssignment(student, lesson);
                    // Check if the lesson falls in the next week
                    assignable = lesson.startTime >= nextWeekStart && lesson.startTime <= nextWeekEnd; // If validation succeeds and lesson is next week, mark as assignable
                } else {
                    assignable = false;
                }
            } catch {
                assignable = false; // If validation fails, the lesson is not assignable
            } finally {
                // Check if lesson is cancelable (more than 2 days from today)
                cancelable = lesson.startTime > cancelableThreshold && isAssigned;
            }

            const lessonWithFlags: ILessonWithStudentFlags = {
                ...lesson.toObject(),
                assignable: assignable,
                cancelable: cancelable

            };

            groupedLessons[currentDayName].lessons.push(lessonWithFlags);
        });


        return groupedLessons;
    }

    isAssignedToLesson(student: IStudent, lesson: ILesson): boolean {
        // Check if the student is already assigned to the lesson
        return lesson.students.some((student) => student._id.toString() === student._id.toString());

    }

    validateAssignment(student: IStudent, lesson: ILesson): void {
        // Ensure the lesson doesn't exceed its capacity
        const maxCapacity = lesson.type === "group" ? 30 : 1;
        if (lesson.students.length >= maxCapacity) {
            throw new AppError(
                lesson.type === "group"
                    ? "Lesson is full (maximum 30 students allowed)."
                    : "Private lesson already has a student.",
                409
            );
        }

        // Ensure the student's preferences match the lesson requirements
        if (!student.preferredStyles.includes(lesson.style)) {
            throw new AppError("Student's preferences do not match the lesson style.", 400);
        }

        if (
            lesson.type === "private" &&
            !["private", "both_prefer_private"].includes(student.lessonPreference)
        ) {
            throw new AppError("Student's preferences do not match the private lesson.", 400);
        }

        if (
            lesson.type === "group" &&
            !["group", "both_prefer_group"].includes(student.lessonPreference)
        ) {
            throw new AppError("Student's preferences do not match the group lesson.", 400);
        }
    }

    async validateLessonParticipants(
        instructorId: mongoose.Types.ObjectId,
        studentIds: mongoose.Types.ObjectId[],
        style: string,
        type: 'private' | 'group'
    ): Promise<void> {
        // Array to collect validation promises
        const validationPromises: Promise<void>[] = [];

        // Validate the instructor
        if (instructorId) {
            validationPromises.push(
                instructorService.validateInstructorForLesson(instructorId.toString(), style)
            );
        }

        // Validate the students
        if (studentIds.length > 0) {
            validationPromises.push(
                studentService.validateStudentsForLesson(studentIds, style, type)
            );
        }

        // Use Promise.all to execute validations in parallel
        await Promise.all(validationPromises);
    }



    private async validateInstructorAvailability(
        instructorId?: mongoose.Types.ObjectId,
        startTime?: Date,
        endTime?: Date
    ): Promise<void> {
        // If any of the parameters are undefined, skip validation
        if (!instructorId || !startTime || !endTime) {
            return;
        }
        console.log("start time"+ startTime);
        // Fetch available hours for the instructor on the given date
        const availableHours = await instructorService.getAvailableHoursForInstructor(
            instructorId.toString(),
            startTime
        );

        if (availableHours.length === 0) {
            throw new AppError("Instructor is not available on the selected date", 400);
        }

        // Convert startTime and endTime to HH:mm format
        const start = startTime.toISOString().slice(11, 16);
        const end = endTime.toISOString().slice(11, 16);

        // Check if the time range fits within any of the available slots
        const isValid = availableHours.some(
            (slot) => start >= slot.start && end <= slot.end
        );

        if (!isValid) {
            throw new AppError("Lesson timing does not fit within the instructor's available hours", 400);
        }
    }
}


export const lessonService = new LessonService();
