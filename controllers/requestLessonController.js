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
exports.unassignStudentFromLessonRequest = exports.getAllLessonRequests = exports.approveLessonRequest = exports.removeLessonRequest = exports.addLessonRequest = void 0;
const lessonRequestService_1 = require("../services/lessonRequestService");
const AppError_1 = require("../errors/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
// Add a new lesson request
const addLessonRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonRequest = yield lessonRequestService_1.lessonRequestService.addRequest(req.body);
        res.status(201).json(lessonRequest);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to add lesson request",
            });
        }
    }
});
exports.addLessonRequest = addLessonRequest;
// Remove a lesson request
const removeLessonRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield lessonRequestService_1.lessonRequestService.removeRequest(id);
        if (!deleted) {
            res.status(404).json({ error: "Lesson request not found" });
            return;
        }
        res.status(200).json({ message: "Lesson request removed successfully" });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to remove lesson request",
            });
        }
    }
});
exports.removeLessonRequest = removeLessonRequest;
// Approve or reject a lesson request
const approveLessonRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { approve } = req.body;
        // Validate the 'approve' field
        if (typeof approve !== "boolean") {
            res.status(400).json({ error: "Missing or invalid 'approve' field in request body" });
            return;
        }
        yield lessonRequestService_1.lessonRequestService.approveRequest(id, approve);
        res.status(200).json({
            message: approve
                ? "Lesson request approved and lesson created"
                : "Lesson request rejected",
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to approve/reject lesson request",
            });
        }
    }
});
exports.approveLessonRequest = approveLessonRequest;
// Get all lesson requests
const getAllLessonRequests = (req, // Accept body parameters
res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { page = "1", limit = "10" } = _a, filters = __rest(_a, ["page", "limit"]); // Extract data from req.body
        // Validate pagination inputs
        const pageNum = Number(page);
        const limitNum = Number(limit);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
            res.status(400).json({ error: "Page and limit must be positive numbers" });
            return;
        }
        // Use the service to fetch lesson requests with filters and pagination
        const result = yield lessonRequestService_1.lessonRequestService.getAllRequests(filters, pageNum, limitNum);
        // Respond with the lesson requests and total count
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            // Handle application-specific errors
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            // Handle generic server errors
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to retrieve lesson requests",
            });
        }
    }
});
exports.getAllLessonRequests = getAllLessonRequests;
// Unassign a student from a lesson request
const unassignStudentFromLessonRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonRequestId, studentId } = req.params;
        // Call the service to unassign the student
        yield lessonRequestService_1.lessonRequestService.unassignStudent(new mongoose_1.default.Types.ObjectId(studentId), new mongoose_1.default.Types.ObjectId(lessonRequestId));
        // Respond with success message
        res.status(200).json({ message: "Student successfully unassigned from lesson request" });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            // Handle application-specific errors
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            // Handle generic server errors
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to unassign student",
            });
        }
    }
});
exports.unassignStudentFromLessonRequest = unassignStudentFromLessonRequest;
