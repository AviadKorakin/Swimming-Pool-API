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
exports.studentService = void 0;
const student_1 = require("../models/student");
const lesson_1 = require("../models/lesson");
const AppError_1 = require("../errors/AppError");
const lessonService_1 = require("./lessonService");
class StudentService {
    // Add a new student
    addStudent(studentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniqueNameData = yield this.generateUniqueName(studentData.firstName, studentData.lastName);
            studentData.firstName = uniqueNameData.firstName;
            studentData.lastName = uniqueNameData.lastName;
            const student = new student_1.Student(studentData);
            return yield student.save();
        });
    }
    // Generate a unique first and last name for a new student
    generateUniqueName(firstName, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            let uniqueLastName = lastName;
            let counter = 1;
            // Query students with the same first name and last name
            const students = yield student_1.Student.find({
                firstName,
                lastName: { $regex: `^${lastName}(\\s*\\(\\d+\\))?$` },
            });
            while (students.some((student) => student.lastName === uniqueLastName)) {
                uniqueLastName = `${lastName}(${counter})`;
                counter++;
            }
            return { firstName, lastName: uniqueLastName };
        });
    }
    // Update student details
    updateStudent(studentId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return student_1.Student.findByIdAndUpdate(studentId, updatedData, { new: true });
        });
    }
    // Delete a student
    deleteStudent(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedStudent = yield student_1.Student.findByIdAndDelete(studentId);
            return !!deletedStudent; // Convert the result to a boolean
        });
    }
    // Get a student by ID
    getStudentById(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return student_1.Student.findById(studentId);
        });
    }
    listStudents() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            // Filter out undefined values
            const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined));
            // Handle special case for lastName with dynamic regex
            if (queryFilters.lastName) {
                const escapedLastName = queryFilters.lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special characters
                const baseRegex = `^${escapedLastName}(\\(\\d+\\))?$`; // Base regex to match variations
                queryFilters.lastName = { $regex: new RegExp(baseRegex, 'i') };
            }
            // Handle special case for preferredStyles (array contains all specified styles)
            if (queryFilters.preferredStyles) {
                queryFilters.preferredStyles = { $all: queryFilters.preferredStyles };
            }
            console.log('Filters after adjustment:', queryFilters);
            // Perform query
            const total = yield student_1.Student.countDocuments(queryFilters);
            const students = yield student_1.Student.find(queryFilters)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return { students, total };
        });
    }
    // Find students matching lesson criteria
    findMatchingStudents(style, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const priorityOrder = type === 'private'
                ? ['private', 'both_prefer_private', 'both_prefer_group']
                : ['group', 'both_prefer_group', 'both_prefer_private'];
            const students = yield student_1.Student.find({
                preferredStyles: style,
                lessonPreference: { $in: priorityOrder }, // Filter students based on the priority list
            }, { _id: 1, firstName: 1, lastName: 1, lessonPreference: 1 } // Fetch necessary fields
            )
                .exec();
            // Sort the students based on the priorityOrder
            const sortedStudents = students.sort((a, b) => priorityOrder.indexOf(a.lessonPreference) - priorityOrder.indexOf(b.lessonPreference));
            // Map the `_id` to `id` and convert to string
            return sortedStudents.map((student) => ({
                id: student._id.toString(),
                firstName: student.firstName,
                lastName: student.lastName,
                lessonPreference: student.lessonPreference
            }));
        });
    }
    // Assign a student to a lesson
    assignStudentToLesson(studentId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield lesson_1.Lesson.findById(lessonId);
            if (!lesson) {
                throw new AppError_1.AppError('Lesson not found', 404);
            }
            const student = yield student_1.Student.findById(studentId);
            if (!student) {
                throw new AppError_1.AppError('Student not found', 404);
            }
            if (lessonService_1.lessonService.isAssignedToLesson(student, lesson))
                throw new AppError_1.AppError("Student is already assigned to this lesson", 409);
            lessonService_1.lessonService.validateAssignment(student, lesson);
            lesson.students.push(student._id);
            yield lesson.save();
            return student;
        });
    }
    // Remove a student from a lesson
    removeStudentFromLesson(studentId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield lesson_1.Lesson.findById(lessonId);
            if (!lesson) {
                throw new AppError_1.AppError('Lesson not found', 404);
            }
            const student = yield student_1.Student.findById(studentId);
            if (!student) {
                throw new AppError_1.AppError('Student not found', 404);
            }
            // Check if the student is assigned to the lesson
            if (!lesson.students.some(id => id.toString() === student._id.toString())) {
                throw new AppError_1.AppError('Student is not assigned to this lesson', 409);
            }
            // Remove the student from the lesson
            lesson.students = lesson.students.filter(id => id.toString() !== student._id.toString());
            yield lesson.save();
            return student;
        });
    }
    // Validate students for a specific lesson
    validateStudentsForLesson(studentIds, style, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const students = yield student_1.Student.find({ _id: { $in: studentIds } });
            // Ensure all students exist
            if (students.length !== studentIds.length) {
                const invalidIds = studentIds.filter((id) => !students.some((student) => student._id.equals(id)));
                throw new AppError_1.AppError(`Invalid student IDs: ${invalidIds.join(', ')}`, 404);
            }
            // Validate each student's preferences
            students.forEach((student) => {
                // Style compatibility
                if (!student.preferredStyles.includes(style)) {
                    throw new AppError_1.AppError(`Student ${student.firstName} ${student.lastName}'s preferences do not match the selected style: ${style}`, 400);
                }
                // Type compatibility
                if (type === 'private' &&
                    !['private', 'both_prefer_private'].includes(student.lessonPreference)) {
                    throw new AppError_1.AppError(`Student ${student.firstName} ${student.lastName}'s preferences do not match the private lesson type.`, 400);
                }
                if (type === 'group' &&
                    !['group', 'both_prefer_group'].includes(student.lessonPreference)) {
                    throw new AppError_1.AppError(`Student ${student.firstName} ${student.lastName}'s preferences do not match the group lesson type.`, 400);
                }
            });
        });
    }
}
exports.studentService = new StudentService();
