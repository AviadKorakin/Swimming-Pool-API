"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const middlewares_1 = __importDefault(require("../middlewares")); // Clerk middleware for authentication
const router = express_1.default.Router();
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
router.post('/register', (0, middlewares_1.default)(), userController_1.registerUser);
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
router.post('/register/student', (0, middlewares_1.default)(), userController_1.registerAsStudent);
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
router.post('/register/instructor', (0, middlewares_1.default)(), userController_1.registerAsInstructor);
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
router.get('/exists', (0, middlewares_1.default)(), userController_1.isExistUser);
/**
 * @swagger
 * /api/users/getState:
 *   get:
 *     summary: Get the state of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   description: User state (0 = not registered, 1 = student, 2 = instructor)
 *                 id:
 *                   type: string
 *                   nullable: true
 *                   description: The student or instructor ID, if applicable
 *       403:
 *         description: Forbidden - User ID missing or unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/getState', (0, middlewares_1.default)(), userController_1.getUserState);
exports.default = router;
