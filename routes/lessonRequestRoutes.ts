import express from 'express';
import {
    addLessonRequest,
    removeLessonRequest,
    approveLessonRequest,
    getAllLessonRequests, unassignStudentFromLessonRequest, getInstructorLessonRequests,
} from '../controllers/requestLessonController';

const router = express.Router();

/**
 * @swagger
 * /api/lesson-requests:
 *   post:
 *     summary: Add a new lesson request
 *     tags: [Lesson Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonRequestRequest'
 *     responses:
 *       201:
 *         description: Lesson request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonRequestResponse'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post('/', addLessonRequest);

/**
 * @swagger
 * /api/lesson-requests/instructor:
 *   post:
 *     summary: Get all lesson requests for a specific instructor
 *     tags: [Lesson Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Number of items per page
 *               status:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 description: Filter lesson requests by status
 *               instructor:
 *                 type: string
 *                 description: Instructor ID (required)
 *               style:
 *                 type: string
 *                 description: Filter by style
 *               type:
 *                 type: string
 *                 enum: [private, group]
 *                 description: Filter by type
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by start time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by end time
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Filter by student IDs
 *     responses:
 *       200:
 *         description: List of instructor's lesson requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessonRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonRequestResponse'
 *                 total:
 *                   type: integer
 *                   description: Total number of lesson requests
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post('/instructor', getInstructorLessonRequests);

/**
 * @swagger
 * /api/lesson-requests/{id}:
 *   delete:
 *     summary: Remove a lesson request
 *     tags: [Lesson Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lesson request to remove
 *     responses:
 *       200:
 *         description: Lesson request removed successfully
 *       404:
 *         description: Lesson request not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', removeLessonRequest);

/**
 * @swagger
 * /api/lesson-requests/{id}/approve:
 *   post:
 *     summary: Approve or reject a lesson request
 *     tags: [Lesson Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lesson request to approve/reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approve:
 *                 type: boolean
 *                 description: Whether to approve or reject the lesson request
 *     responses:
 *       200:
 *         description: Lesson request approved/rejected successfully
 *       400:
 *         description: Missing or invalid 'approve' field
 *       404:
 *         description: Lesson request not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/approve', approveLessonRequest);

/**
 * @swagger
 * /api/lesson-requests/all:
 *   post:
 *     summary: Get all lesson requests
 *     tags: [Lesson Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Number of items per page
 *               status:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 description: Filter lesson requests by status
 *               instructor:
 *                 type: string
 *                 description: Filter by instructor ID
 *               style:
 *                 type: string
 *                 description: Filter by style
 *               type:
 *                 type: string
 *                 enum: [private, group]
 *                 description: Filter by type
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by start time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by end time
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Filter by student IDs
 *     responses:
 *       200:
 *         description: List of lesson requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessonRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonRequestResponse'
 *                 total:
 *                   type: integer
 *                   description: Total number of lesson requests
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post('/all', getAllLessonRequests);


/**
 * @swagger
 * /api/lesson-requests/{lessonRequestId}/students/{studentId}:
 *   delete:
 *     summary: Unassign a student from a lesson request
 *     tags: [Lesson Requests]
 *     parameters:
 *       - in: path
 *         name: lessonRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lesson request
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student to unassign
 *     responses:
 *       200:
 *         description: Student successfully unassigned from the lesson request
 *       400:
 *         description: Invalid input data or unassignment not allowed
 *       404:
 *         description: Lesson request or student not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:lessonRequestId/students/:studentId', unassignStudentFromLessonRequest);

export default router;
