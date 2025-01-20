"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lessonController_1 = require("../controllers/lessonController");
const router = express_1.default.Router();
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
router.post('/', lessonController_1.addLesson);
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
router.put('/:id', lessonController_1.updateLesson);
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
router.delete('/:id', lessonController_1.removeLesson);
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
router.get('/', lessonController_1.getAllLessons);
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
 *         description: A date within the week to retrieve lessons (e.g., "2025-01-20").
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Filter lessons by instructor ID.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to filter lessons only for the specified instructor ID.
 *     responses:
 *       200:
 *         description: Weekly lessons grouped by days, including additional metadata for each lesson.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Sunday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Monday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Tuesday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Wednesday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Thursday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Friday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 *                 Saturday:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     editable:
 *                       type: boolean
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LessonResponse'
 */
router.get('/weekly', lessonController_1.getWeeklyLessons);
/**
 * @swagger
 * /api/lessons/student-weekly:
 *   get:
 *     summary: Get lessons for a specific student for a given week
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: A date within the week to retrieve lessons (e.g., "2025-01-20").
 *       - in: query
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student.
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: (Optional) Filter lessons by instructor ID.
 *     responses:
 *       200:
 *         description: Weekly lessons for the student grouped by days, including assignable flags.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeeklyStudentLessonData'
 *       400:
 *         description: Invalid or missing parameters.
 *       404:
 *         description: Student not found.
 */
router.get('/student-weekly', lessonController_1.getStudentWeeklyLessons);
exports.default = router;
