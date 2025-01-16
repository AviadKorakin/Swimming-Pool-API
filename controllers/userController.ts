import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { IStudent } from '../models/student';
import { IInstructor } from '../models/instructor';
import {AppError} from "../errors/AppError";

// Register User
export const registerUser = async (
    req: Request<{}, {}, { role: 'student' | 'instructor' | 'admin' }>,
    res: Response<{ message: string; user?: unknown } | { error: string }>
): Promise<void> => {
    console.log('[registerUser] Start processing request');

    try {
        const userId = req.auth?.userId;
        const { role } = req.body;

        console.log('[registerUser] Received request data:', { userId, role });

        // Validate input
        if (!userId || !role) {
            console.error('[registerUser] Validation failed: User ID or role is missing');
            res.status(400).json({ error: 'User ID and role are required' });
            return;
        }

        console.log('[registerUser] Input is valid, proceeding to register user');

        // Register the user using the service
        const user = await userService.registerUser(userId, role);
        console.log('[registerUser] User registered successfully:', user);

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error.code === 11000) {
            console.warn('[registerUser] Duplicate key error:', error.keyValue);
            res.status(409).json({ error: 'User already exists with this ID' });
        } else if (error instanceof Error && error.message.includes('User already exists')) {
            console.warn('[registerUser] Conflict: User already exists');
            res.status(409).json({ error: error.message });
        } else {
            console.error('[registerUser] Internal server error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    console.log('[registerUser] End processing request');
};


// Register as Student
export const registerAsStudent = async (
    req: Request<{}, {}, Omit<IStudent, '_id'>>,
    res: Response<IStudent | { error: string }>
): Promise<void> => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }

        const student = await userService.registerAsStudent(userId, req.body);
        res.status(201).json(student);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('User must have a role of student')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// Register as Instructor
export const registerAsInstructor = async (
    req: Request<{}, {}, Omit<IInstructor, '_id'>>,
    res: Response<IInstructor | { error: string }>
): Promise<void> => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }

        const instructor = await userService.registerAsInstructor(userId, req.body);
        res.status(201).json(instructor);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else if (error instanceof Error && error.message.includes('User must have a role of instructor')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// Check if User Exists
export const isExistUser = async (
    req: Request,
    res: Response<{ exists: boolean } | { error: string }>
): Promise<void> => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }
        console.log('[isExistUser] Checking existence for userId:', userId);

        const exists = await userService.isExists(userId);

        console.log(`[isExistUser] User with ID ${userId} exists:`, exists);
        res.status(200).json({ exists });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            console.error('[isExistUser] Internal server error:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }
};
// Get User State
export const getUserState = async (
    req: Request,
    res: Response<{ state: number; details: IStudent | IInstructor | null } | { error: string }>
): Promise<void> => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }

        console.log('[getUserState] Fetching state for userId:', userId);

        const userState = await userService.getUserState(userId);

        console.log(`[getUserState] State for userId ${userId}:`, userState);
        res.status(200).json(userState);
    } catch (error) {
        console.error('[getUserState] Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
