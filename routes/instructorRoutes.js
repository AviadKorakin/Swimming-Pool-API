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
