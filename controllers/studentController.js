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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStudentFromLesson = exports.assignStudentToLesson = exports.listStudents = exports.findMatchingStudents = exports.deleteStudent = exports.getStudentById = exports.updateStudent = exports.addStudent = void 0;
const studentService_1 = require("../services/studentService");
const AppError_1 = require("../errors/AppError");
// Add a student
const addStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield studentService_1.studentService.addStudent(req.body);
        res.status(201).json(student);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('Validation failed')) {
            res.status(400).json({ error: 'Invalid student data' });
        }
        else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add student' });
        }
    }
});
exports.addStudent = addStudent;
// Update a student
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedStudent = yield studentService_1.studentService.updateStudent(id, req.body);
        if (!updatedStudent) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.status(200).json(updatedStudent);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        }
        else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update student' });
        }
    }
});
exports.updateStudent = updateStudent;
const getStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Fetch the student by ID
        const student = yield studentService_1.studentService.getStudentById(id);
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.status(200).json(student);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        }
        else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch student' });
        }
    }
});
exports.getStudentById = getStudentById;
// Delete a student
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedStudent = yield studentService_1.studentService.deleteStudent(id);
        if (!deletedStudent) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        }
        else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete student' });
        }
    }
});
exports.deleteStudent = deleteStudent;
// Find matching students for a lesson
const findMatchingStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { style, type } = req.query;
        if (!style || !type) {
            res.status(400).json({ error: 'Style and type are required query parameters' });
            return;
        }
        const students = yield studentService_1.studentService.findMatchingStudents(style, type);
        res.status(200).json(students);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to find matching students' });
    }
});
exports.findMatchingStudents = findMatchingStudents;
// List all students with optional filters and pagination
const listStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { page = '1', limit = '10' } = _a, filters = __rest(_a, ["page", "limit"]);
        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({ error: 'Page and limit must be valid numbers' });
            return;
        }
        const filterConditions = {
            firstName: filters.firstName,
            lastName: filters.lastName,
            preferredStyles: filters.preferredStyles,
            lessonPreference: filters.lessonPreference,
        };
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);
        const studentsResult = yield studentService_1.studentService.listStudents(filterConditions, numericPage, numericLimit);
        res.status(200).json({
            students: studentsResult.students,
            total: studentsResult.total,
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to retrieve students' });
    }
});
exports.listStudents = listStudents;
// Assign a student to a lesson
const assignStudentToLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonId, studentId } = req.params;
        yield studentService_1.studentService.assignStudentToLesson(studentId, lessonId);
        res.status(200).json({ message: 'Student successfully assigned to the lesson.' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to assign student to the lesson' });
    }
});
exports.assignStudentToLesson = assignStudentToLesson;
// Remove a student from a lesson
const removeStudentFromLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonId, studentId } = req.params;
        yield studentService_1.studentService.removeStudentFromLesson(studentId, lessonId);
        res.status(200).json({ message: 'Student successfully removed from the lesson.' });
    }
    catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove student from the lesson' });
    }
});
exports.removeStudentFromLesson = removeStudentFromLesson;
