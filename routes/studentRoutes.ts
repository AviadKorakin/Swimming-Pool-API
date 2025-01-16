import express from 'express';
import {
    addStudent,
    updateStudent,
    deleteStudent,
    listStudents,
    findMatchingStudents, getStudentById, removeStudentFromLesson, assignStudentToLesson,
} from '../controllers/studentController';

const router = express.Router();

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
 *     responses:
 *       201:
 *         description: Student added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentResponse'
 */
router.post('/',addStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id', updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:id', deleteStudent);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: List all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of students per page
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Filter by first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter by last name
 *       - in: query
 *         name: lessonPreference
 *         schema:
 *           type: string
 *           enum: [private, group, both_prefer_private, both_prefer_group]
 *         description: Filter by lesson preference
 *       - in: query
 *         name: preferredStyles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by preferred swimming styles (e.g., freestyle, backstroke)
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentResponse'
 */
router.get('/', listStudents);


/**
 * @swagger
 * /api/students/match:
 *   get:
 *     summary: Find students matching lesson criteria
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: style
 *         required: true
 *         schema:
 *           type: string
 *         description: The swimming style (e.g., freestyle)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [private, group]
 *         description: The type of lesson
 *     responses:
 *       200:
 *         description: List of matching students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentResponse'
 */
router.get('/match', findMatchingStudents);
/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:id', getStudentById);


/**
 * @swagger
 * /api/students/{studentId}/lessons/{lessonId}:
 *   post:
 *     summary: Assign a student to a lesson
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student successfully assigned to the lesson
 *       400:
 *         description: Failed to assign student to the lesson
 */
router.post('/:studentId/lessons/:lessonId', assignStudentToLesson);

/**
 * @swagger
 * /api/students/{studentId}/lessons/{lessonId}:
 *   delete:
 *     summary: Remove a student from a lesson
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student successfully removed from the lesson
 *       400:
 *         description: Failed to remove student from the lesson
 */
router.delete('/:studentId/lessons/:lessonId', removeStudentFromLesson);


export default router;
