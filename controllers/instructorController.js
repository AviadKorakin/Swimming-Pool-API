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
exports.findAvailableInstructors = exports.getInstructorById = exports.getAllInstructors = exports.removeInstructor = exports.updateInstructor = exports.addInstructor = void 0;
const instructorService_1 = require("../services/instructorService");
// Add an instructor
const addInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructor = yield instructorService_1.instructorService.addInstructor(req.body);
        res.status(201).json(instructor);
    }
    catch (error) {
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
        const updatedInstructor = yield instructorService_1.instructorService.updateInstructor(id, req.body);
        if (!updatedInstructor) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json(updatedInstructor);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to update instructor',
        });
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
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to retrieve instructor',
        });
    }
});
exports.getInstructorById = getInstructorById;
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
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to find available instructors',
        });
    }
});
exports.findAvailableInstructors = findAvailableInstructors;
