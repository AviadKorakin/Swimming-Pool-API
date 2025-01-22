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
exports.lessonRequestService = void 0;
const LessonRequest_1 = require("../models/LessonRequest");
const AppError_1 = require("../errors/AppError");
const lessonService_1 = require("./lessonService");
const lesson_1 = require("../models/lesson");
const mongoose_1 = __importDefault(require("mongoose"));
class LessonRequestService {
    // Add a new lesson request
    addRequest(requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate participants and times
            requestData.startTime = new Date(requestData.startTime);
            requestData.endTime = new Date(requestData.endTime);
            lessonService_1.lessonService.validateLessonDates(requestData.startTime, requestData.endTime);
            // Run validations concurrently using Promise.all
            yield Promise.all([
                lessonService_1.lessonService.validateLessonParticipants(requestData.instructor, requestData.students, requestData.style, requestData.type),
                this.validateNoOverlappingRequests(requestData.instructor, requestData.startTime, requestData.endTime),
                this.validateStudentPendingRequests(requestData.students)
            ]);
            // Create and save the lesson request
            const lessonRequest = new LessonRequest_1.LessonRequest(requestData);
            return yield lessonRequest.save();
        });
    }
    // Remove an existing lesson request
    removeRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedRequest = yield LessonRequest_1.LessonRequest.findByIdAndDelete(requestId);
            if (!deletedRequest) {
                throw new AppError_1.AppError("Lesson request not found", 404);
            }
            return true;
        });
    }
    // Approve or reject a lesson request
    approveRequest(requestId, approve) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the lesson request
            const request = yield LessonRequest_1.LessonRequest.findById(requestId);
            if (!request) {
                throw new AppError_1.AppError("Lesson request not found", 404);
            }
            // Ensure the request is still pending
            if (request.status !== "pending") {
                throw new AppError_1.AppError("Only pending requests can be approved or rejected", 400);
            }
            // If rejecting the request
            if (!approve) {
                request.status = "rejected";
                yield request.save();
                return;
            }
            // Validate the lesson participants
            yield lessonService_1.lessonService.validateLessonParticipants(request.instructor, request.students, request.style, request.type);
            // Validate the lesson dates
            lessonService_1.lessonService.validateLessonDates(request.startTime, request.endTime);
            // Approve the request
            request.status = "approved";
            yield request.save();
            // Create a new lesson based on the approved request
            const lesson = new lesson_1.Lesson({
                instructor: request.instructor,
                students: request.students,
                style: request.style,
                type: request.type,
                startTime: request.startTime,
                endTime: request.endTime,
            });
            yield lesson.save();
        });
    }
    // Get all lesson requests with optional filters and pagination
    getAllInstructorRequests() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            // Convert startTime and endTime to Date objects if provided
            if (filters.startTime)
                filters.startTime = new Date(filters.startTime);
            if (filters.endTime)
                filters.endTime = new Date(filters.endTime);
            console.log("filters:", filters);
            const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined));
            if (filters.startTime) {
                queryFilters.startTime = { $gte: filters.startTime }; // Greater than or equal to startTime
            }
            if (filters.endTime) {
                queryFilters.endTime = { $lte: filters.endTime }; // Less than or equal to endTime
            }
            // Handle the status filter as an array
            if (queryFilters.status && Array.isArray(queryFilters.status)) {
                queryFilters.status = { $in: queryFilters.status }; // Use MongoDB $in operator
            }
            // Handle students filter
            if (queryFilters.students && Array.isArray(queryFilters.students)) {
                queryFilters.students = { $in: queryFilters.students }; // Match any student in the array
            }
            console.log("queryFilters:", queryFilters);
            // Count total matching requests
            const total = yield LessonRequest_1.LessonRequest.countDocuments(queryFilters);
            console.log("Total matching requests:", total);
            // Fetch requests with population and sorting
            const lessonRequests = yield LessonRequest_1.LessonRequest.find(queryFilters)
                .populate("instructor students") // Populate referenced fields
                .sort({ createdAt: -1 }) // Sort by most recent first
                .skip((page - 1) * limit)
                .limit(limit);
            // Add `canApprove` to each request and cast back to `ILessonRequest[]`
            const lessonRequestsWithFlags = yield Promise.all(lessonRequests.map((request) => __awaiter(this, void 0, void 0, function* () {
                const canApprove = yield this.isEligibleForApproval(request);
                const enhancedRequest = Object.assign(Object.assign({}, request.toObject()), { canApprove });
                // Cast back to ILessonRequest
                return enhancedRequest;
            })));
            return { lessonRequests: lessonRequestsWithFlags, total };
        });
    }
    getAllRequests() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            // Convert startTime and endTime to Date objects if provided
            if (filters.startTime)
                filters.startTime = new Date(filters.startTime);
            if (filters.endTime)
                filters.endTime = new Date(filters.endTime);
            console.log("filters:", filters);
            const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined));
            if (filters.startTime) {
                queryFilters.startTime = { $gte: filters.startTime }; // Greater than or equal to startTime
            }
            if (filters.endTime) {
                queryFilters.endTime = { $lte: filters.endTime }; // Less than or equal to endTime
            }
            // Handle the status filter as an array
            if (queryFilters.status && Array.isArray(queryFilters.status)) {
                queryFilters.status = { $in: queryFilters.status }; // Use MongoDB $in operator
            }
            // Handle students filter
            if (queryFilters.students && Array.isArray(queryFilters.students)) {
                queryFilters.students = { $in: queryFilters.students }; // Match any student in the array
            }
            console.log("queryFilters:", queryFilters);
            // Count total matching requests
            const total = yield LessonRequest_1.LessonRequest.countDocuments(queryFilters);
            console.log("Total matching requests:", total);
            // Fetch requests with population and sorting
            const lessonRequests = yield LessonRequest_1.LessonRequest.find(queryFilters)
                .populate("instructor students") // Populate referenced fields
                .sort({ createdAt: -1 }) // Sort by most recent first
                .skip((page - 1) * limit)
                .limit(limit);
            return { lessonRequests, total };
        });
    }
    isEligibleForApproval(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Validating request:", {
                    instructor: request.instructor,
                    students: request.students,
                    style: request.style,
                    type: request.type,
                    startTime: request.startTime,
                    endTime: request.endTime,
                });
                // Validate participants
                try {
                    yield lessonService_1.lessonService.validateLessonParticipants(request.instructor, request.students, request.style, request.type);
                }
                catch (error) {
                    console.error("Validation failed for participants:", {
                        instructor: request.instructor,
                        students: request.students,
                        style: request.style,
                        type: request.type,
                        error: error instanceof Error ? error.message : error,
                    });
                    return false;
                }
                // Validate lesson dates
                try {
                    lessonService_1.lessonService.validateLessonDates(request.startTime, request.endTime);
                }
                catch (error) {
                    console.error("Validation failed for lesson dates:", {
                        startTime: request.startTime,
                        endTime: request.endTime,
                        error: error instanceof Error ? error.message : error,
                    });
                    return false;
                }
                return true; // If all validations pass, the request is canApprove
            }
            catch (generalError) {
                console.error("Unexpected error during eligibility check:", {
                    request,
                    error: generalError instanceof Error ? generalError.message : generalError,
                });
                return false;
            }
        });
    }
    // Validate no overlapping requests
    validateNoOverlappingRequests(instructorId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const overlappingRequest = yield LessonRequest_1.LessonRequest.findOne({
                instructor: instructorId,
                $or: [
                    {
                        // Case 1: Existing request starts before the new request ends and ends after the new request starts
                        startTime: { $lt: endTime },
                        endTime: { $gt: startTime },
                    },
                    {
                        // Case 2: New request completely includes an existing request
                        startTime: { $gte: startTime, $lt: endTime }, // Use $lt for end boundary
                    },
                    {
                        // Case 3: Existing request completely includes the new request
                        endTime: { $gt: startTime, $lte: endTime }, // Use $gt for start boundary
                    },
                ],
            });
            if (overlappingRequest) {
                throw new AppError_1.AppError("The instructor already has a lesson request during the specified time range.", 400);
            }
        });
    }
    // Validate that no student has more than 2 pending requests
    validateStudentPendingRequests(studentIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch the number of pending requests for each student
            const objectIds = studentIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
            const pendingCounts = yield LessonRequest_1.LessonRequest.aggregate([
                {
                    $match: {
                        status: "pending",
                        students: { $in: objectIds },
                    },
                },
                {
                    $unwind: {
                        path: "$students",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: "$students",
                        count: { $sum: 1 },
                    },
                },
            ]);
            console.log("pending Counts" + pendingCounts);
            // Check if any student exceeds the limit of 2 pending requests
            const studentsExceedingLimit = pendingCounts.filter((student) => student.count >= 2);
            if (studentsExceedingLimit.length > 0) {
                const studentIdsExceedingLimit = studentsExceedingLimit.map((student) => student._id.toString());
                throw new AppError_1.AppError(`Students with IDs ${studentIdsExceedingLimit.join(", ")} already have 2 or more pending lesson requests.`, 400);
            }
        });
    }
    // Unassign a student from a lesson request
    unassignStudent(studentId, lessonRequestId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the lesson request by ID
            const lessonRequest = yield LessonRequest_1.LessonRequest.findById(lessonRequestId);
            if (!lessonRequest) {
                throw new AppError_1.AppError("Lesson request not found", 404);
            }
            // Check if the student is part of the lesson request
            if (!lessonRequest.students.includes(studentId)) {
                throw new AppError_1.AppError("Student not assigned to this lesson request", 400);
            }
            // Remove the student from the lesson request
            lessonRequest.students = lessonRequest.students.filter((id) => id.toString() !== studentId.toString());
            // Save the updated lesson request
            yield lessonRequest.save();
        });
    }
}
exports.lessonRequestService = new LessonRequestService();
