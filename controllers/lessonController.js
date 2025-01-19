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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableHoursForInstructor = exports.getWeeklyLessons = exports.getAllLessons = exports.removeLesson = exports.updateLesson = exports.addLesson = void 0;
const lessonService_1 = require("../services/lessonService");
const AppError_1 = require("../errors/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
// Add a new lesson
const addLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lesson = yield lessonService_1.lessonService.addLesson(req.body);
        res.status(201).json(lesson);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to add lesson' });
    }
});
exports.addLesson = addLesson;
// Update an existing lesson
const updateLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedLesson = yield lessonService_1.lessonService.updateLesson(id, req.body);
        if (!updatedLesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        res.status(200).json(updatedLesson);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update lesson' });
    }
});
exports.updateLesson = updateLesson;
// Remove a lesson
const removeLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield lessonService_1.lessonService.removeLesson(id);
        if (!deleted) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        res.status(200).json({ message: 'Lesson removed successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove lesson' });
    }
});
exports.removeLesson = removeLesson;
// Get all lessons
const getAllLessons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { page = '1', limit = '10' } = _a, filters = __rest(_a, ["page", "limit"]);
        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({ error: 'Page and limit must be valid numbers' });
            return;
        }
        const result = yield lessonService_1.lessonService.getAllLessons(filters, Number(page), Number(limit));
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to retrieve lessons' });
    }
});
exports.getAllLessons = getAllLessons;
// Get weekly lessons
const getWeeklyLessons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, instructorId, sort } = req.query;
        // Validate the date parameter
        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: 'Invalid or missing date parameter' });
            return;
        }
        // Parse `sort` parameter (optional) and convert it to boolean
        const sortFlag = sort === 'true';
        const weeklyLessons = yield lessonService_1.lessonService.getWeeklyLessons(new Date(date), instructorId ? instructorId : undefined, sortFlag);
        res.status(200).json(weeklyLessons);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve weekly lessons',
            });
        }
    }
});
exports.getWeeklyLessons = getWeeklyLessons;
const getAvailableHoursForInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instructorId, date } = req.query;
        // Validate instructorId and date parameters
        if (!instructorId || !mongoose_1.default.Types.ObjectId.isValid(instructorId)) {
            res.status(400).json({ error: 'Invalid or missing instructorId parameter' });
            return;
        }
        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: 'Invalid or missing date parameter' });
            return;
        }
        const availableHours = yield lessonService_1.lessonService.getAvailableHoursForInstructor(instructorId, new Date(date));
        res.status(200).json({ availableHours });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve available hours',
            });
        }
    }
});
exports.getAvailableHoursForInstructor = getAvailableHoursForInstructor;
