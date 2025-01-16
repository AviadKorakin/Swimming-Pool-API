"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAsInstructor = exports.registerAsStudent = exports.registerUser = void 0;
const userService_1 = require("../services/userService");
// Register User
// Register User
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('[registerUser] Start processing request');
    try {
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
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
        const user = yield userService_1.userService.registerUser(userId, role);
        console.log('[registerUser] User registered successfully:', user);
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('User already exists')) {
            console.warn('[registerUser] Conflict: User already exists');
            res.status(409).json({ error: error.message });
        }
        else {
            console.error('[registerUser] Internal server error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    console.log('[registerUser] End processing request');
});
exports.registerUser = registerUser;
// Register as Student
const registerAsStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }
        const student = yield userService_1.userService.registerAsStudent(userId, req.body);
        res.status(201).json(student);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('User must have a role of student')) {
            res.status(403).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.registerAsStudent = registerAsStudent;
// Register as Instructor
const registerAsInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(403).json({ error: 'User ID is missing or unauthorized' });
            return;
        }
        const instructor = yield userService_1.userService.registerAsInstructor(userId, req.body);
        res.status(201).json(instructor);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('User must have a role of instructor')) {
            res.status(403).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.registerAsInstructor = registerAsInstructor;
