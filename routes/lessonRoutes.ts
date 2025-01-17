import express from 'express';
import {addLesson, updateLesson, removeLesson, getAllLessons, getWeeklyLessons} from '../controllers/lessonController';

const router = express.Router();

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Add a new lesson
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonRequest'
 *     responses:
 *       201:
 *         description: Lesson added successfully
 */
router.post('/', addLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
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
 *             $ref: '#/components/schemas/LessonRequest'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 */
router.put('/:id', updateLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Remove a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson removed successfully
 */
router.delete('/:id', removeLesson);

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *         description: Filter by instructor ID
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Filter by style
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [private, group]
 *         description: Filter by type
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *         description: Filter by start time
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *         description: Filter by end time
 *     responses:
 *       200:
 *         description: List of lessons retrieved successfully
 */
router.get('/', getAllLessons);

/**
 * @swagger
 * /api/lessons/weekly:
 *   get:
 *     summary: Get lessons for a specific week
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: A date within the week to retrieve lessons (e.g., "2025-01-20")
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Filter lessons by instructor ID
 *     responses:
 *       200:
 *         description: Weekly lessons grouped by days
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sunday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 monday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 tuesday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 wednesday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 thursday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 friday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 *                 saturday:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonResponse'
 */
router.get('/weekly', getWeeklyLessons);


export default router;
