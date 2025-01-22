import {LessonRequest, ILessonRequest, RequestLessonFilter} from "../models/LessonRequest";
import { AppError } from "../errors/AppError";
import { lessonService } from "./lessonService";
import { Lesson } from "../models/lesson";
import mongoose from "mongoose";

class LessonRequestService {
    // Add a new lesson request
    async addRequest(requestData: Omit<ILessonRequest, "_id">): Promise<ILessonRequest> {
        // Validate participants and times
        requestData.startTime= new Date(requestData.startTime);
        requestData.endTime= new Date(requestData.endTime);

        lessonService.validateLessonDates(requestData.startTime, requestData.endTime);

        // Run validations concurrently using Promise.all
        await Promise.all([
            lessonService.validateLessonParticipants(
                requestData.instructor,
                requestData.students,
                requestData.style,
                requestData.type
            ),
            this.validateNoOverlappingRequests(
                requestData.instructor,
                requestData.startTime,
                requestData.endTime
            ),
            this.validateStudentPendingRequests(requestData.students)
        ]);

        // Create and save the lesson request
        const lessonRequest = new LessonRequest(requestData);
        return await lessonRequest.save();
    }

    // Remove an existing lesson request
    async removeRequest(requestId: string): Promise<boolean> {
        const deletedRequest = await LessonRequest.findByIdAndDelete(requestId);
        if (!deletedRequest) {
            throw new AppError("Lesson request not found", 404);
        }
        return true;
    }

    // Approve or reject a lesson request
    async approveRequest(requestId: string, approve: boolean): Promise<void> {
        // Find the lesson request
        const request = await LessonRequest.findById(requestId);

        if (!request) {
            throw new AppError("Lesson request not found", 404);
        }

        // Ensure the request is still pending
        if (request.status !== "pending") {
            throw new AppError("Only pending requests can be approved or rejected", 400);
        }

        // If rejecting the request
        if (!approve) {
            request.status = "rejected";
            await request.save();
            return;
        }

        // Validate the lesson participants
        await lessonService.validateLessonParticipants(
            request.instructor,
            request.students,
            request.style,
            request.type
        );

        // Validate the lesson dates
        lessonService.validateLessonDates(request.startTime, request.endTime);

        // Approve the request
        request.status = "approved";
        await request.save();

        // Create a new lesson based on the approved request
        const lesson = new Lesson({
            instructor: request.instructor,
            students: request.students,
            style: request.style,
            type: request.type,
            startTime: request.startTime,
            endTime: request.endTime,
        });

        await lesson.save();
    }


    // Get all lesson requests with optional filters and pagination
    async getAllInstructorRequests(
        filters: RequestLessonFilter = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ lessonRequests: ILessonRequest[]; total: number }> {
        // Remove undefined fields from filters
        const queryFilters: Record<string, any> = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );

        // Count total matching requests
        const total = await LessonRequest.countDocuments(queryFilters);

        // Fetch requests with population and sorting
        const lessonRequests = await LessonRequest.find(queryFilters)
            .populate("instructor students") // Populate referenced fields
            .sort({ createdAt: -1 }) // Sort by most recent first
            .skip((page - 1) * limit)
            .limit(limit);

        // Add `canApprove` to each request and cast back to `ILessonRequest[]`
        const lessonRequestsWithFlags = await Promise.all(
            lessonRequests.map(async (request) => {
                const canApprove = await this.isEligibleForApproval(request);
                const enhancedRequest = {
                    ...request.toObject(),
                    canApprove,
                };
                // Cast back to ILessonRequest
                return enhancedRequest as ILessonRequest;
            })
        );

        return { lessonRequests: lessonRequestsWithFlags, total };
    }
    async getAllRequests(
        filters: RequestLessonFilter = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ lessonRequests: ILessonRequest[]; total: number }> {
        // Remove undefined fields from filters
        if( filters.startTime)
        filters.startTime = new Date(filters.startTime);
        if( filters.endTime)
            filters.endTime = new Date(filters.endTime);
        console.log("filters" + filters);
        const queryFilters: Record<string, any> = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );

        // Handle the status filter as an array
        if (queryFilters.status && Array.isArray(queryFilters.status)) {
            queryFilters.status = { $in: queryFilters.status }; // Use MongoDB $in operator
        }

        // Count total matching requests
        const total = await LessonRequest.countDocuments(queryFilters);

        // Fetch requests with population and sorting
        const lessonRequests = await LessonRequest.find(queryFilters)
            .populate("instructor students") // Populate referenced fields
            .sort({ createdAt: -1 }) // Sort by most recent first
            .skip((page - 1) * limit)
            .limit(limit);

        return { lessonRequests: lessonRequests, total };
    }


// Helper method to check if a request is canApprove
    private async isEligibleForApproval(request: ILessonRequest): Promise<boolean> {
        try {
            // Validate participants and times
            await lessonService.validateLessonParticipants(
                request.instructor,
                request.students,
                request.style,
                request.type
            );
            lessonService.validateLessonDates(request.startTime, request.endTime);

            return true; // If validation passes, request is canApprove
        } catch {
            return false; // If validation fails, request is not canApprove
        }
    }

    // Validate no overlapping requests
    private async validateNoOverlappingRequests(
        instructorId: mongoose.Types.ObjectId,
        startTime: Date,
        endTime: Date
    ): Promise<void> {
        const overlappingRequest = await LessonRequest.findOne({
            instructor: instructorId,
            $or: [
                {
                    startTime: { $lt: endTime }, // Starts before the new request ends
                    endTime: { $gt: startTime }, // Ends after the new request starts
                },
                {
                    startTime: { $gte: startTime, $lte: endTime }, // New request includes existing request
                },
                {
                    endTime: { $gte: startTime, $lte: endTime }, // Existing request includes new request
                },
            ],
        });

        if (overlappingRequest) {
            throw new AppError(
                "The instructor already has a lesson request during the specified time range.",
                400
            );
        }
    }
    // Validate that no student has more than 2 pending requests
    private async validateStudentPendingRequests(studentIds: mongoose.Types.ObjectId[]): Promise<void> {
        // Fetch the number of pending requests for each student
        const pendingCounts = await LessonRequest.aggregate([
            {
                $match: {
                    status: "pending",
                    students: { $in: studentIds },
                },
            },
            {
                $unwind: "$students",
            },
            {
                $group: {
                    _id: "$students",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Check if any student exceeds the limit of 2 pending requests
        const studentsExceedingLimit = pendingCounts.filter((student) => student.count >= 2);

        if (studentsExceedingLimit.length > 0) {
            const studentIdsExceedingLimit = studentsExceedingLimit.map((student) => student._id.toString());
            throw new AppError(
                `Students with IDs ${studentIdsExceedingLimit.join(
                    ", "
                )} already have 2 or more pending lesson requests.`,
                400
            );
        }
    }
    // Unassign a student from a lesson request
    async unassignStudent(
        studentId: mongoose.Types.ObjectId,
        lessonRequestId: mongoose.Types.ObjectId
    ): Promise<void> {
        // Find the lesson request by ID
        const lessonRequest = await LessonRequest.findById(lessonRequestId);

        if (!lessonRequest) {
            throw new AppError("Lesson request not found", 404);
        }

        // Check if the student is part of the lesson request
        if (!lessonRequest.students.includes(studentId)) {
            throw new AppError("Student not assigned to this lesson request", 400);
        }

        // Remove the student from the lesson request
        lessonRequest.students = lessonRequest.students.filter(
            (id) => id.toString() !== studentId.toString()
        );

        // Save the updated lesson request
        await lessonRequest.save();
    }
}


export const lessonRequestService = new LessonRequestService();
