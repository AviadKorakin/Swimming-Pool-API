import { Request, Response } from 'express';
import { instructorService } from '../services/instructorService';
import {IInstructor, WeeklyAvailability} from '../models/instructor';
import {AppError} from "../errors/AppError";
import mongoose from "mongoose";

// Add an instructor
export const addInstructor = async (
    req: Request<{}, {}, Omit<IInstructor,'_id'>>,
    res: Response<IInstructor | { error: string }>
): Promise<void> => {
    try {
        const instructor = await instructorService.addInstructor(req.body);
        res.status(201).json(instructor);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof mongoose.Error.ValidationError && error.name === 'ValidationError') {
            // Handle Mongoose validation errors
            res.status(400).json({
                error: `Validation Error: ${error.message}`,
            });
        } else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to add instructor',
        });
    }
};

// Update an instructor
export const updateInstructor = async (
    req: Request<{ id: string }, {}, Partial<IInstructor>>,
    res: Response<IInstructor | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;
        const requestBody = req.body;

        // Log the request data
        console.log('Update Instructor Request:');
        console.log('Instructor ID:', id);
        console.log('Request Body:', requestBody);

        const updatedInstructor = await instructorService.updateInstructor(id, requestBody);

        if (!updatedInstructor) {
            console.log('Instructor not found:', id);
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }

        console.log('Updated Instructor:', updatedInstructor);
        res.status(200).json(updatedInstructor);
    } catch (error) {
        // Log the error
        console.error('Error in updateInstructor:', error);

        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to update instructor',
            });
        }
    }
};

// Remove an instructor
export const removeInstructor = async (
    req: Request<{ id: string }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await instructorService.removeInstructor(id);
        if (!deleted) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json({ message: 'Instructor removed successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to remove instructor',
        });
    }
};

// Get all instructors
export const getAllInstructors = async (
    req: Request<{}, {}, {}, { page?: string; limit?: string }>,
    res: Response<{ instructors: IInstructor[]; total: number } | { error: string }>
): Promise<void> => {
    try {
        const { page = '1', limit = '10' } = req.query;

        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({ error: 'Page and limit must be valid numbers' });
            return;
        }

        const result = await instructorService.getAllInstructors(Number(page), Number(limit));
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to retrieve instructors',
        });
    }
};

// Get instructor by ID
export const getInstructorById = async (
    req: Request<{ id: string }>,
    res: Response<IInstructor | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;
        const instructor = await instructorService.getInstructorById(id);
        if (!instructor) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json(instructor);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to retrieve instructor',
        });
    }
};
export const getAvailableHoursForInstructor = async (
    req: Request<{}, {}, {}, { instructorId: string; date: string }>,
    res: Response<{ availableHours: { start: string; end: string }[] } | { error: string }>
): Promise<void> => {
    try {
        const { instructorId, date } = req.query;

        // Validate instructorId and date parameters
        if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
            res.status(400).json({ error: 'Invalid or missing instructorId parameter' });
            return;
        }

        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: 'Invalid or missing date parameter' });
            return;
        }
        console.log("date before available hours" + date);

        const availableHours = await instructorService.getAvailableHoursForInstructor(instructorId, new Date(date));

        res.status(200).json({ availableHours });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve available hours',
            });
        }
    }
};

// Find available instructors
export const findAvailableInstructors = async (
    req: Request<{}, {}, {}, { day: string; time: string; styles: string[] }>,
    res: Response<IInstructor[] | { error: string }>
): Promise<void> => {
    try {
        const { day, time, styles } = req.query;

        if (!day || !time || !styles || !styles.length) {
            res.status(400).json({ error: 'day, time, and styles are required parameters' });
            return;
        }

        const instructors = await instructorService.findAvailableInstructors(day, time, styles);
        res.status(200).json(instructors);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to find available instructors',
        });
    }
};

// Get weekly available hours for instructors
export const getWeeklyAvailableHours = async (
    req: Request<{}, {}, { date: string; styles: string[]; instructorIds?: string[] }>,
    res: Response<{ weeklyAvailability: WeeklyAvailability[] } | { error: string }>
): Promise<void> => {
    try {
        const { date, styles, instructorIds } = req.body;

        // Validate input parameters
        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: "Invalid or missing date parameter" });
            return;
        }

        if (!styles || !styles.length) {
            res.status(400).json({ error: "Styles parameter is required and cannot be empty" });
            return;
        }

        // Validate the `instructorIds` parameter, if provided
        if (instructorIds && !Array.isArray(instructorIds)) {
            res.status(400).json({ error: "Instructor IDs parameter must be an array if provided" });
            return;
        }

        // Check for invalid instructor IDs, if provided
        if (instructorIds && instructorIds.length > 0) {
            const invalidIds = instructorIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                res.status(400).json({ error: `Invalid instructor IDs: ${invalidIds.join(", ")}` });
                return;
            }
        }
        // Call the service method
        const weeklyAvailability = await instructorService.getWeeklyAvailableHours(
            new Date(date),
            styles,
            instructorIds
        );

        // Send response
        res.status(200).json({ weeklyAvailability });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Failed to retrieve weekly available hours",
            });
        }
    }
};
