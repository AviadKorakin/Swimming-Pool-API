import {LessonRequest, ILessonRequest, RequestLessonFilter} from "../models/LessonRequest";
import { AppError } from "../errors/AppError";
import { lessonService } from "./lessonService";
import { Lesson } from "../models/lesson";

class LessonRequestService {
    // Add a new lesson request
    async addRequest(requestData: Omit<ILessonRequest, "_id">): Promise<ILessonRequest> {
        // Validate participants and times
        await lessonService.validateLessonParticipants(
            requestData.instructor,
            requestData.students,
            requestData.style,
            requestData.type
        );
        lessonService.validateLessonDates(requestData.startTime, requestData.endTime);

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
    // Get all lesson requests with optional filters and pagination
    async getAllRequests(
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

}

export const lessonRequestService = new LessonRequestService();
