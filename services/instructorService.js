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
exports.instructorService = void 0;
const instructor_1 = require("../models/instructor");
const AppError_1 = require("../errors/AppError");
const lesson_1 = require("../models/lesson");
const LessonRequest_1 = require("../models/LessonRequest");
class InstructorService {
    // Add a new instructor with overlap validation
    addInstructor(instructorData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (instructorData.availableHours) {
                instructorData.availableHours = this.sortAvailableHours(instructorData.availableHours);
                this.validateAvailableHours(instructorData.availableHours);
            }
            // Ensure the name is unique
            instructorData.name = yield this.generateUniqueName(instructorData.name);
            const instructor = new instructor_1.Instructor(instructorData);
            return yield instructor.save();
        });
    }
    // Update instructor details with overlap validation
    updateInstructor(instructorId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (updatedData.availableHours) {
                updatedData.availableHours = this.sortAvailableHours(updatedData.availableHours);
                this.validateAvailableHours(updatedData.availableHours);
            }
            return instructor_1.Instructor.findByIdAndUpdate(instructorId, updatedData, { new: true });
        });
    }
    // Rearrange availableHours by sorting them by day and start time
    sortAvailableHours(availableHours) {
        const dayOrder = {
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
    validateAvailableHours(availableHours) {
        // Group by day
        const hoursByDay = availableHours.reduce((acc, { day, start, end }) => {
            if (!acc[day])
                acc[day] = [];
            acc[day].push({ start, end });
            return acc;
        }, {});
        // Check for overlaps and validate start and end times within each day
        for (const [day, hours] of Object.entries(hoursByDay)) {
            hours.sort((a, b) => a.start.localeCompare(b.start)); // Sort by start time
            for (let i = 0; i < hours.length; i++) {
                const current = hours[i];
                // Validate that the start time is less than the end time
                if (current.start >= current.end) {
                    throw new AppError_1.AppError(`Invalid time range on ${day}: Start time (${current.start}) must be earlier than end time (${current.end}).`, 400);
                }
                // Validate overlap with the next time range
                if (i < hours.length - 1) {
                    const next = hours[i + 1];
                    if (current.end > next.start) {
                        throw new AppError_1.AppError(`Overlapping time ranges found on ${day}: ${current.start}-${current.end} overlaps with ${next.start}-${next.end}.`, 409);
                    }
                }
            }
        }
    }
    // Generate a unique name
    generateUniqueName(baseName) {
        return __awaiter(this, void 0, void 0, function* () {
            let uniqueName = baseName;
            let count = 1;
            while (yield instructor_1.Instructor.exists({ name: uniqueName })) {
                uniqueName = `${baseName}(${count})`;
                count++;
            }
            return uniqueName;
        });
    }
    // Remove an instructor
    removeInstructor(instructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield instructor_1.Instructor.findByIdAndDelete(instructorId);
            return result !== null;
        });
    }
    // Get all instructors (with optional pagination)
    getAllInstructors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const total = yield instructor_1.Instructor.countDocuments();
            const instructors = yield instructor_1.Instructor.find()
                .sort({ name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return { instructors, total };
        });
    }
    // Get instructor by ID
    getInstructorById(instructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return instructor_1.Instructor.findById(instructorId);
        });
    }
    // Find available instructors for specific time and styles
    findAvailableInstructors(day, time, styles) {
        return __awaiter(this, void 0, void 0, function* () {
            return instructor_1.Instructor.find({
                availableHours: {
                    $elemMatch: {
                        day: day,
                        start: { $lte: time },
                        end: { $gte: time },
                    },
                },
                expertise: { $all: styles }, // Match all styles in the array
            });
        });
    }
    // Get working days for an instructor
    getInstructorWorkingDays(instructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructor = yield this.getInstructorById(instructorId);
            if (!instructor) {
                throw new AppError_1.AppError('Instructor not found', 404);
            }
            // Extract unique days from the availableHours array
            return Array.from(new Set(instructor.availableHours.map((day) => day.day)));
        });
    }
    getAvailableHoursForInstructor(instructorId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch instructor details
            const instructor = yield exports.instructorService.getInstructorById(instructorId);
            if (!instructor) {
                throw new AppError_1.AppError("Instructor not found", 404);
            }
            // Convert the date to the corresponding day of the week
            const dayOfWeek = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ][date.getDay()];
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
            const lessons = yield lesson_1.Lesson.find({
                startTime: { $gte: startOfDay, $lte: endOfDay },
            });
            // Calculate available time slots
            const bookedSlots = lessons.map((lesson) => ({
                start: lesson.startTime.toISOString().slice(11, 16), // Extract HH:mm format
                end: lesson.endTime.toISOString().slice(11, 16),
            }));
            const availableSlots = [];
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
        });
    }
    // Validate instructor for a specific lesson
    validateInstructorForLesson(instructorId, style) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructor = yield this.getInstructorById(instructorId);
            if (!instructor) {
                throw new AppError_1.AppError('Instructor does not exist', 404);
            }
            // Ensure the instructor has expertise in the requested style
            if (!instructor.expertise.includes(style)) {
                throw new AppError_1.AppError(`Instructor does not have expertise in the selected style: ${style}`, 400);
            }
        });
    }
    getWeeklyAvailableHours(date, styles, instructorIds) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                throw new AppError_1.AppError(errorMessage, 400);
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
            const instructors = yield instructor_1.Instructor.find(instructorQuery).exec();
            // Extract instructor IDs
            const fetchedInstructorIds = instructors.map((instructor) => instructor._id.toString());
            // Fetch all lessons for the week in one query
            const [lessons, lessonRequests] = yield Promise.all([
                lesson_1.Lesson.find({
                    instructor: { $in: fetchedInstructorIds },
                    startTime: { $gte: startOfWeek, $lte: endOfWeek },
                }).exec(),
                LessonRequest_1.LessonRequest.find({
                    instructor: { $in: fetchedInstructorIds },
                    startTime: { $gte: startOfWeek, $lte: endOfWeek },
                    status: "pending", // Only consider pending requests
                }).exec(),
            ]);
            console.log("Fetched lessons:", lessons);
            // Group lessons by instructor and day of the week
            const allScheduledSlots = {};
            const processSchedule = (schedule) => {
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
            const result = [];
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
                const weeklyHours = [];
                // Iterate through each day of the week
                for (let i = 0; i < 7; i++) {
                    const currentDay = new Date(startOfWeek);
                    currentDay.setDate(startOfWeek.getDate() + i);
                    const dayOfWeek = [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                    ][i];
                    const workingHours = instructor.availableHours.filter((hour) => hour.day === dayOfWeek);
                    if (workingHours.length === 0) {
                        continue;
                    }
                    const dayLessons = ((_a = allScheduledSlots[instructor._id.toString()]) === null || _a === void 0 ? void 0 : _a[currentDay.toISOString().slice(0, 10)]) || [];
                    const availableHours = [];
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
        });
    }
}
exports.instructorService = new InstructorService();
