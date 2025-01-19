import {Request, Response} from 'express';
import {lessonService} from '../services/lessonService';
import {ILesson, LessonFilter, WeeklyLessonData} from '../models/lesson';
import {AppError} from "../errors/AppError";
import mongoose from "mongoose";

// Add a new lesson
export const addLesson = async (
    req: Request<{}, {}, Omit<ILesson, '_id'>>,
    res: Response<ILesson | { error: string }>
): Promise<void> => {
    try {
        const lesson = await lessonService.addLesson(req.body);
        res.status(201).json(lesson);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({error: error.message});
        } else
            res.status(400).json({error: error instanceof Error ? error.message : 'Failed to add lesson'});
    }
};

// Update an existing lesson
export const updateLesson = async (
    req: Request<{ id: string }, {}, Partial<ILesson>>,
    res: Response<ILesson | { error: string }>
): Promise<void> => {
    try {
        const {id} = req.params;
        const updatedLesson = await lessonService.updateLesson(id, req.body);
        if (!updatedLesson) {
            res.status(404).json({error: 'Lesson not found'});
            return;
        }
        res.status(200).json(updatedLesson);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({error: error.message});
        } else
            res.status(400).json({error: error instanceof Error ? error.message : 'Failed to update lesson'});
    }
};

// Remove a lesson
export const removeLesson = async (
    req: Request<{ id: string }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const {id} = req.params;
        const deleted = await lessonService.removeLesson(id);
        if (!deleted) {
            res.status(404).json({error: 'Lesson not found'});
            return;
        }
        res.status(200).json({message: 'Lesson removed successfully'});
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({error: error.message});
        } else
            res.status(400).json({error: error instanceof Error ? error.message : 'Failed to remove lesson'});
    }
};

// Get all lessons
export const getAllLessons = async (
    req: Request<{}, {}, {}, LessonFilter & { page?: string; limit?: string }>,
    res: Response<{ lessons: ILesson[]; total: number } | { error: string }>
): Promise<void> => {
    try {
        const {page = '1', limit = '10', ...filters} = req.query;

        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({error: 'Page and limit must be valid numbers'});
            return;
        }

        const result = await lessonService.getAllLessons(filters, Number(page), Number(limit));
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({error: error.message});
        } else
            res.status(400).json({error: error instanceof Error ? error.message : 'Failed to retrieve lessons'});
    }
}

// Get weekly lessons
export const getWeeklyLessons = async (
    req: Request<{}, {}, {}, { date: string; instructorId?: string; sort?: string }>,
    res: Response<WeeklyLessonData | { error: string }>
): Promise<void> => {
    try {
        const { date, instructorId, sort } = req.query;

        // Validate the date parameter
        if (!date || isNaN(Date.parse(date))) {
            res.status(400).json({ error: 'Invalid or missing date parameter' });
            return;
        }

        // Parse `sort` parameter (optional) and convert it to boolean
        const sortFlag = sort === 'true';

        const weeklyLessons = await lessonService.getWeeklyLessons(
            new Date(date),
            instructorId ? instructorId : undefined,
            sortFlag
        );

        res.status(200).json(weeklyLessons);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to retrieve weekly lessons',
            });
        }
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

        const availableHours = await lessonService.getAvailableHoursForInstructor(instructorId, new Date(date));

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
