import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { IStudent } from '../models/student';
import { IInstructor } from '../models/instructor';

// Register User
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
    } catch (error) {
        if (error instanceof Error && error.message.includes('User already exists')) {
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
        if (error instanceof Error && error.message.includes('User must have a role of student')) {
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
        if (error instanceof Error && error.message.includes('User must have a role of instructor')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
