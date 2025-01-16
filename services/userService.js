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
exports.userService = void 0;
const user_1 = require("../models/user");
const studentService_1 = require("./studentService");
const instructorService_1 = require("./instructorService");
const AppError_1 = require("../errors/AppError");
class UserService {
    isExists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield user_1.User.exists({ _id: userId })) !== null;
        });
    }
    // Register User
    registerUser(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new user_1.User({
                _id: userId,
                role,
                instructor: null,
                student: null,
            });
            yield newUser.save();
            return newUser;
        });
    }
    // Register as Student
    registerAsStudent(userId, studentData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isExists(userId))
                throw new AppError_1.AppError('User already exists with this ID', 409);
            const student = yield studentService_1.studentService.addStudent(studentData);
            const newUser = new user_1.User({
                _id: userId,
                role: 'student',
                instructor: null,
                student: student._id,
            });
            yield newUser.save();
            return student;
        });
    }
    // Register as Instructor
    registerAsInstructor(userId, instructorData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isExists(userId))
                throw new AppError_1.AppError('User already exists with this ID', 409);
            const instructor = yield instructorService_1.instructorService.addInstructor(instructorData);
            const newUser = new user_1.User({
                _id: userId,
                role: 'instructor',
                instructor: instructor._id,
                student: null,
            });
            yield newUser.save();
            return instructor;
        });
    }
    // Get user state based on userId
    getUserState(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the user by ID
            const user = yield user_1.User.findById(userId);
            if (!user) {
                // User not found, state 0
                return { state: 0, details: null };
            }
            // Determine the state and fetch details based on the role
            if (user.role === 'student' && user.student) {
                const student = yield studentService_1.studentService.getStudentById(user.student.toString());
                return { state: 1, details: student || null }; // Return student details
            }
            else if (user.role === 'instructor' && user.instructor) {
                const instructor = yield instructorService_1.instructorService.getInstructorById(user.instructor.toString());
                return { state: 2, details: instructor || null }; // Return instructor details
            }
            // User is registered but no associated role ID
            return { state: 0, details: null };
        });
    }
}
exports.userService = new UserService();
