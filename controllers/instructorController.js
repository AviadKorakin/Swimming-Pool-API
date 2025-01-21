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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyAvailableHours = exports.findAvailableInstructors = exports.getAvailableHoursForInstructor = exports.getInstructorById = exports.getAllInstructors = exports.removeInstructor = exports.updateInstructor = exports.addInstructor = void 0;
const instructorService_1 = require("../services/instructorService");
const AppError_1 = require("../errors/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
// Add an instructor
const addInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructor = yield instructorService_1.instructorService.addInstructor(req.body);
        res.status(201).json(instructor);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof mongoose_1.default.Error.ValidationError && error.name === 'ValidationError') {
            // Handle Mongoose validation errors
            res.status(400).json({
                error: `Validation Error: ${error.message}`,
            });
        }
        else
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to add instructor',
            });
    }
});
exports.addInstructor = addInstructor;
// Update an instructor
const updateInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const requestBody = req.body;
        // Log the request data
        console.log('Update Instructor Request:');
        console.log('Instructor ID:', id);
        console.log('Request Body:', requestBody);
        const updatedInstructor = yield instructorService_1.instructorService.updateInstructor(id, requestBody);
        if (!updatedInstructor) {
            console.log('Instructor not found:', id);
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        console.log('Updated Instructor:', updatedInstructor);
        res.status(200).json(updatedInstructor);
    }
    catch (error) {
        // Log the error
        console.error('Error in updateInstructor:', error);
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to update instructor',
            });
        }
    }
});
exports.updateInstructor = updateInstructor;
// Remove an instructor
const removeInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield instructorService_1.instructorService.removeInstructor(id);
        if (!deleted) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json({ message: 'Instructor removed successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to remove instructor',
            });
    }
});
exports.removeInstructor = removeInstructor;
// Get all instructors
const getAllInstructors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = '1', limit = '10' } = req.query;
        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({ error: 'Page and limit must be valid numbers' });
            return;
        }
        const result = yield instructorService_1.instructorService.getAllInstructors(Number(page), Number(limit));
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve instructors',
            });
    }
});
exports.getAllInstructors = getAllInstructors;
// Get instructor by ID
const getInstructorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const instructor = yield instructorService_1.instructorService.getInstructorById(id);
        if (!instructor) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json(instructor);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve instructor',
            });
    }
});
exports.getInstructorById = getInstructorById;
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
        console.log("date before availble hours" + date);
        const availableHours = yield instructorService_1.instructorService.getAvailableHoursForInstructor(instructorId, new Date(date));
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
// Find available instructors
const findAvailableInstructors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { day, time, styles } = req.query;
        if (!day || !time || !styles || !styles.length) {
            res.status(400).json({ error: 'day, time, and styles are required parameters' });
            return;
        }
        const instructors = yield instructorService_1.instructorService.findAvailableInstructors(day, time, styles);
        res.status(200).json(instructors);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to find available instructors',
            });
    }
});
exports.findAvailableInstructors = findAvailableInstructors;
// Get weekly available hours for instructors
const getWeeklyAvailableHours = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, styles, instructorIds } = req.query;
        // Validate input parameters
        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: "Invalid or missing date parameter" });
            return;
        }
        if (!styles || !styles.length) {
            res.status(400).json({ error: "Styles parameter is required and cannot be empty" });
            return;
        }
        if (!instructorIds || !Array.isArray(instructorIds) || instructorIds.length === 0) {
            res.status(400).json({ error: "Instructor IDs parameter is required and cannot be empty" });
            return;
        }
        // Ensure all instructor IDs are valid MongoDB ObjectIds
        const invalidIds = instructorIds.filter((id) => !mongoose_1.default.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            res.status(400).json({ error: `Invalid instructor IDs: ${invalidIds.join(", ")}` });
            return;
        }
        // Call the service method
        const weeklyAvailability = yield instructorService_1.instructorService.getWeeklyAvailableHours(new Date(date), styles, instructorIds);
        // Send response
        res.status(200).json({ weeklyAvailability });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Failed to retrieve weekly available hours",
            });
        }
    }
});
exports.getWeeklyAvailableHours = getWeeklyAvailableHours;
