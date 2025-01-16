"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonService = void 0;
const lesson_1 = require("../models/lesson");
const AppError_1 = require("../errors/AppError");
class LessonService {
    // Add a new lesson
    addLesson(lessonData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateLessonOverlap(lessonData.instructor, lessonData.startTime, lessonData.endTime);
            const lesson = new lesson_1.Lesson(lessonData);
            return yield lesson.save();
        });
    }
    // Update an existing lesson
    updateLesson(lessonId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingLesson = yield lesson_1.Lesson.findById(lessonId);
            if (!existingLesson) {
                throw new AppError_1.AppError('Lesson not found', 404);
            }
            const startTime = updatedData.startTime || existingLesson.startTime;
            const endTime = updatedData.endTime || existingLesson.endTime;
            yield this.validateLessonOverlap(updatedData.instructor || existingLesson.instructor, startTime, endTime, lessonId // Exclude the current lesson from validation
            );
            return lesson_1.Lesson.findByIdAndUpdate(lessonId, updatedData, { new: true });
        });
    }
    // Remove a lesson
    removeLesson(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedLesson = yield lesson_1.Lesson.findByIdAndDelete(lessonId);
            return !!deletedLesson;
        });
    }
    // Get all lessons (optional filters like instructor, type, etc.)
    getAllLessons() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined));
            const total = yield lesson_1.Lesson.countDocuments(queryFilters);
            const lessons = yield lesson_1.Lesson.find(queryFilters)
                .populate('instructor students')
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return { lessons, total };
        });
    }
    // Validate that a lesson does not overlap with existing lessons for the same instructor
    validateLessonOverlap(instructorId, startTime, endTime, excludeLessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const overlappingLessons = yield lesson_1.Lesson.find({
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
                throw new AppError_1.AppError('Lesson times overlap with another lesson for this instructor.', 409);
            }
        });
    }
}
exports.lessonService = new LessonService();
