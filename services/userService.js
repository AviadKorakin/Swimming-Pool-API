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
const student_1 = require("../models/student");
const instructor_1 = require("../models/instructor");
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
            const user = yield user_1.User.findById(userId);
            if (!user || user.role !== 'student') {
                throw new Error('User must have a role of student to register as student.');
            }
            const student = new student_1.Student(studentData);
            yield student.save();
            user.student = student._id;
            yield user.save();
            return student;
        });
    }
    // Register as Instructor
    registerAsInstructor(userId, instructorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.User.findById(userId);
            if (!user || user.role !== 'instructor') {
                throw new Error('User must have a role of instructor to register as instructor.');
            }
            const instructor = new instructor_1.Instructor(instructorData);
            yield instructor.save();
            user.instructor = instructor._id;
            yield user.save();
            return instructor;
        });
    }
}
exports.userService = new UserService();
