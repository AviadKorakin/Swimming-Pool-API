import { Request, Response } from 'express';
import { instructorService } from '../services/instructorService';
import { IInstructor } from '../models/instructor';
import {AppError} from "../errors/AppError";

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
        else
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
        const updatedInstructor = await instructorService.updateInstructor(id, req.body);
        if (!updatedInstructor) {
            res.status(404).json({ error: 'Instructor not found' });
            return;
        }
        res.status(200).json(updatedInstructor);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to update instructor',
        });
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
