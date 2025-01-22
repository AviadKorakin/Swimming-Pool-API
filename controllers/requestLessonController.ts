import { Request, Response } from "express";
import { lessonRequestService } from "../services/lessonRequestService";
import { ILessonRequest, RequestLessonFilter } from "../models/LessonRequest";
import { AppError } from "../errors/AppError";

// Add a new lesson request
export const addLessonRequest = async (
    req: Request<{}, {}, Omit<ILessonRequest, "_id">>,
    res: Response<ILessonRequest | { error: string }>
): Promise<void> => {
    try {
        const lessonRequest = await lessonRequestService.addRequest(req.body);
        res.status(201).json(lessonRequest);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to add lesson request",
            });
        }
    }
};

// Remove a lesson request
export const removeLessonRequest = async (
    req: Request<{ id: string }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await lessonRequestService.removeRequest(id);
        if (!deleted) {
            res.status(404).json({ error: "Lesson request not found" });
            return;
        }

        res.status(200).json({ message: "Lesson request removed successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to remove lesson request",
            });
        }
    }
};

// Approve or reject a lesson request
export const approveLessonRequest = async (
    req: Request<{ id: string }, {}, { approve: boolean }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;
        const { approve } = req.body;

        // Validate the 'approve' field
        if (typeof approve !== "boolean") {
            res.status(400).json({ error: "Missing or invalid 'approve' field in request body" });
            return;
        }

        await lessonRequestService.approveRequest(id, approve);

        res.status(200).json({
            message: approve
                ? "Lesson request approved and lesson created"
                : "Lesson request rejected",
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to approve/reject lesson request",
            });
        }
    }
};

// Get all lesson requests
export const getAllLessonRequests = async (
    req: Request<{}, {}, RequestLessonFilter & { page?: string; limit?: string }>, // Accept body parameters
    res: Response<{ lessonRequests: ILessonRequest[]; total: number } | { error: string }>
): Promise<void> => {
    try {
        const { page = "1", limit = "10", ...filters } = req.body; // Extract data from req.body

        // Validate pagination inputs
        const pageNum = Number(page);
        const limitNum = Number(limit);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
            res.status(400).json({ error: "Page and limit must be positive numbers" });
            return;
        }

        // Use the service to fetch lesson requests with filters and pagination
        const result = await lessonRequestService.getAllRequests(filters, pageNum, limitNum);

        // Respond with the lesson requests and total count
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            // Handle application-specific errors
            res.status(error.statusCode).json({ error: error.message });
        } else {
            // Handle generic server errors
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to retrieve lesson requests",
            });
        }
    }
};
