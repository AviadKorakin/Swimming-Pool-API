import {ILesson, Lesson, LessonFilter} from '../models/lesson';
import mongoose from 'mongoose';

class LessonService {
    // Add a new lesson
    async addLesson(lessonData: Omit<ILesson,'_id'>): Promise<ILesson> {
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
            throw new Error('Lesson not found');
        }

        const startTime = updatedData.startTime || existingLesson.startTime;
        const endTime = updatedData.endTime || existingLesson.endTime;

        await this.validateLessonOverlap(
            updatedData.instructor || existingLesson.instructor,
            startTime,
            endTime,
            lessonId // Exclude the current lesson from validation
        );

        return Lesson.findByIdAndUpdate(lessonId, updatedData,  {new: true});
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

        return { lessons, total };
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
            _id: { $ne: excludeLessonId }, // Exclude current lesson if updating
            $or: [
                {
                    startTime: { $lt: endTime, $gte: startTime },
                },
                {
                    endTime: { $gt: startTime, $lte: endTime },
                },
                {
                    startTime: { $lte: startTime },
                    endTime: { $gte: endTime },
                },
            ],
        });

        if (overlappingLessons.length > 0) {
            throw new Error(
                'Lesson times overlap with another lesson for this instructor.'
            );
        }
    }
}

export const lessonService = new LessonService();
