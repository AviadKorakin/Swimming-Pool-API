"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const instructorController_1 = require("../controllers/instructorController");
const router = express_1.default.Router();
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
router.post('/', instructorController_1.addInstructor);
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
router.put('/:id', instructorController_1.updateInstructor);
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
router.delete('/:id', instructorController_1.removeInstructor);
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
router.get('/', instructorController_1.getAllInstructors);
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
router.get('/availability', instructorController_1.findAvailableInstructors);
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
router.get('/available-hours', instructorController_1.getAvailableHoursForInstructor);
/**
 * @swagger
 * /api/instructors/weekly-available-hours:
 *   get:
 *     summary: Get weekly available hours for multiple instructors
 *     tags: [Instructors]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The starting date of the week (e.g., "2025-01-20").
 *       - in: query
 *         name: styles
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of swimming styles to filter by expertise.
 *       - in: query
 *         name: instructorIds
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of instructor IDs to fetch availability for.
 *     responses:
 *       200:
 *         description: Weekly available hours retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   instructorId:
 *                     type: string
 *                   instructorName:
 *                     type: string
 *                   weeklyHours:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                           example: "Monday"
 *                         availableHours:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               start:
 *                                 type: string
 *                                 example: "09:00"
 *                               end:
 *                                 type: string
 *                                 example: "11:00"
 *       400:
 *         description: Invalid or missing query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid date parameter"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve weekly available hours"
 */
router.post('/weekly-available-hours', instructorController_1.getWeeklyAvailableHours);
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
router.get('/:id', instructorController_1.getInstructorById);
exports.default = router;
