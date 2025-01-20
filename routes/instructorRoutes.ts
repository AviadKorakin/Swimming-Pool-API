import express from 'express';
import {
    addInstructor,
    updateInstructor,
    removeInstructor,
    getAllInstructors,
    getInstructorById,
    findAvailableInstructors, getAvailableHoursForInstructor,
} from '../controllers/instructorController';

const router = express.Router();

/**
 * @swagger
 * /api/instructors:
 *   post:
 *     summary: Add a new instructor
 *     tags: [Instructors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstructorRequest'
 *     responses:
 *       200:
 *         description: Instructor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorResponse'
 */
router.post('/', addInstructor);

/**
 * @swagger
 * /api/instructors/{id}:
 *   put:
 *     summary: Update an instructor
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstructorRequest'
 *     responses:
 *       200:
 *         description: Instructor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorResponse'
 */
router.put('/:id', updateInstructor);

/**
 * @swagger
 * /api/instructors/{id}:
 *   delete:
 *     summary: Remove an instructor
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instructor removed successfully
 */
router.delete('/:id', removeInstructor);

/**
 * @swagger
 * /api/instructors:
 *   get:
 *     summary: Get all instructors
 *     tags: [Instructors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of instructors to retrieve per page (default is 10)
 *     responses:
 *       200:
 *         description: List of instructors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instructors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InstructorResponse'
 *                 total:
 *                   type: integer
 *                   description: Total number of instructors
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid page or limit parameter"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve instructors"
 */

router.get('/', getAllInstructors);

/**
 * @swagger
 * /api/instructors/availability:
 *   get:
 *     summary: Find available instructors
 *     tags: [Instructors]
 *     parameters:
 *       - in: query
 *         name: day
 *         required: true
 *         schema:
 *           type: string
 *           example: "Monday"
 *         description: The day to check availability
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           example: "14:00"
 *         description: The time to check availability (in HH:mm format)
 *       - in: query
 *         name: styles
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             example: "freestyle"
 *         description: The required swimming styles (must match all styles)
 *     responses:
 *       200:
 *         description: Available instructors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstructorResponse'
 *       400:
 *         description: Missing or invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Day, time, and styles are required query parameters"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to find available instructors"
 */
router.get('/availability', findAvailableInstructors);

/**
 * @swagger
 * /api/instructors/{id}:
 *   get:
 *     summary: Get an instructor by ID
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the instructor
 *     responses:
 *       200:
 *         description: Instructor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstructorResponse'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid instructor ID format"
 *       404:
 *         description: Instructor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Instructor not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve instructor"
 */

router.get('/:id', getInstructorById);


/**
 * @swagger
 * /api/lessons/available-hours:
 *   get:
 *     summary: Get available hours for a specific instructor on a given date
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the instructor
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date for which to fetch available hours (e.g., "2025-01-20").
 *     responses:
 *       200:
 *         description: List of available hours for the specified instructor and date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: Available hour in HH:mm format
 *       400:
 *         description: Invalid request or missing parameters
 *       404:
 *         description: Instructor not found or no available hours
 */
router.get('/available-hours', getAvailableHoursForInstructor);

export default router;
