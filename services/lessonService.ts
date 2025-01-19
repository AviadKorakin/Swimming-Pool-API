import {ILesson, ILessonWithFlags, Lesson, LessonFilter, WeeklyLessonData} from '../models/lesson';
import mongoose from 'mongoose';
import {AppError} from "../errors/AppError";
import {instructorService} from "./instructorService";
import {DayOfWeek} from "../models/instructor";

class LessonService {
    // Add a new lesson
    async addLesson(lessonData: Omit<ILesson, '_id'>): Promise<ILesson> {
        // Ensure start and end times are in the future
        this.validateLessonDates(lessonData.startTime, lessonData.endTime);

        await this.validateLessonOverlap(
            lessonData.instructor,
            lessonData.startTime,
            lessonData.endTime
        );

        const lesson = new Lesson(lessonData);
        return await lesson.save();
    }

    // Update an existing lesson
    async updateLesson(
        lessonId: string,
        updatedData: Partial<ILesson>
    ): Promise<ILesson | null> {
        const existingLesson = await Lesson.findById(lessonId);
        if (!existingLesson) {
            throw new AppError('Lesson not found', 404);
        }

        const startTime = updatedData.startTime || existingLesson.startTime;
        const endTime = updatedData.endTime || existingLesson.endTime;

        // Ensure start and end times are in the future
        this.validateLessonDates(startTime, endTime);

        await this.validateLessonOverlap(
            updatedData.instructor || existingLesson.instructor,
            startTime,
            endTime,
            lessonId // Exclude the current lesson from validation
        );

        return Lesson.findByIdAndUpdate(lessonId, updatedData, {new: true});
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
    private validateLessonDates(startTime: Date, endTime: Date): void {
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
        instructorId: mongoose.Types.ObjectId,
        startTime: Date,
        endTime: Date,
        excludeLessonId?: string
    ): Promise<void> {
        const overlappingLessons = await Lesson.find({
            instructor: instructorId,
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
                'Lesson times overlap with another lesson for this instructor.', 409
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

        const lessons = await Lesson.find(query).populate('instructor students').exec();
        const instructorWorkingDays =  instructorId? await instructorService.getInstructorWorkingDays(instructorId!) : [];

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
            console.log("lesson istructor" + lesson.instructor._id.toString())
            console.log("lesson istructor2 " +instructorId);
            console.log("today " + today);
            console.log("lesson day " +lessonDay);
            console.log("isLessonInFuture " + isLessonInFuture);
            console.log("isInstructorLesson "+ isInstructorLesson);

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
}



    export const lessonService = new LessonService();
