import express from 'express';
import {
    registerUser,
    registerAsStudent,
    registerAsInstructor,
    isExistUser,
} from '../controllers/userController';
import { requireAuth } from '@clerk/express'; // Clerk middleware for authentication

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user with a specific role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: ['student', 'instructor', 'admin']
 *                 description: The role of the user
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request - Missing user ID or role
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', requireAuth(), registerUser);

/**
 * @swagger
 * /api/users/register/student:
 *   post:
 *     summary: Register authenticated user as a student
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
 *     responses:
 *       200:
 *         description: Registered as student successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       403:
 *         description: Forbidden - User ID missing or unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/register/student', requireAuth(), registerAsStudent);

/**
 * @swagger
 * /api/users/register/instructor:
 *   post:
 *     summary: Register authenticated user as an instructor
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstructorRequest'
 *     responses:
 *       200:
 *         description: Registered as instructor successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorResponse'
 *       403:
 *         description: Forbidden - User ID missing or unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/register/instructor', requireAuth(), registerAsInstructor);

/**
 * @swagger
 * /api/users/exists:
 *   get:
 *     summary: Check if the authenticated user exists
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User existence check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       403:
 *         description: Forbidden - User ID missing or unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/exists', requireAuth(), isExistUser);

export default router;
