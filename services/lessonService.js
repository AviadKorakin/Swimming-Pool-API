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
const instructorService_1 = require("./instructorService");
class LessonService {
    // Add a new lesson
    addLesson(lessonData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure start and end times are in the future
            this.validateLessonDates(lessonData.startTime, lessonData.endTime);
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
            // Ensure start and end times are in the future
            this.validateLessonDates(startTime, endTime);
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
    // Validate start and end times
    validateLessonDates(startTime, endTime) {
        const currentTime = new Date();
        if (startTime <= currentTime) {
            throw new AppError_1.AppError('Start time must be in the future', 400);
        }
        if (endTime <= startTime) {
            throw new AppError_1.AppError('End time must be after the start time', 400);
        }
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
    getWeeklyLessons(date_1, instructorId_1) {
        return __awaiter(this, arguments, void 0, function* (date, instructorId, sort = false) {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay()); // Move to Sunday
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
            endOfWeek.setHours(23, 59, 59, 999);
            const query = {
                startTime: { $gte: startOfWeek, $lte: endOfWeek },
            };
            if (sort && instructorId) {
                query.instructor = instructorId;
            }
            const lessons = yield lesson_1.Lesson.find(query).populate('instructor students').exec();
            const instructorWorkingDays = yield instructorService_1.instructorService.getInstructorWorkingDays(instructorId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dayNames = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            const groupedLessons = {
                Sunday: { date: new Date(), editable: false, lessons: [] },
                Monday: { date: new Date(), editable: false, lessons: [] },
                Tuesday: { date: new Date(), editable: false, lessons: [] },
                Wednesday: { date: new Date(), editable: false, lessons: [] },
                Thursday: { date: new Date(), editable: false, lessons: [] },
                Friday: { date: new Date(), editable: false, lessons: [] },
                Saturday: { date: new Date(), editable: false, lessons: [] },
            };
            lessons.forEach((lesson) => {
                const lessonDay = new Date(lesson.startTime).getDay();
                const currentDayName = dayNames[lessonDay];
                const isLessonInFuture = lesson.startTime > today;
                const isInstructorLesson = lesson.instructor.toString() === instructorId;
                const lessonWithFlags = Object.assign(Object.assign({}, lesson.toObject()), { editable: isLessonInFuture && isInstructorLesson, deletable: isLessonInFuture && isInstructorLesson });
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
        });
    }
}
exports.lessonService = new LessonService();
