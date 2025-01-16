import { User, IUser } from '../models/user';
import { IStudent } from '../models/student';
import { IInstructor } from '../models/instructor';
import {studentService} from './studentService';
import {instructorService} from "./instructorService";
import {AppError} from "../errors/AppError";

class UserService {

    async isExists(userId: string): Promise<boolean> {
        return await User.exists({_id: userId}) !== null;
    }

    // Register User
    async registerUser(userId: string, role: 'student' | 'instructor' | 'admin'): Promise<IUser> {
        const newUser = new User({
            _id: userId,
            role,
            instructor: null,
            student: null,
        });

        await newUser.save();
        return newUser;
    }

    // Register as Student
    async registerAsStudent(userId: string, studentData: Omit<IStudent, '_id'>): Promise<IStudent> {
        if (await this.isExists(userId)) throw new AppError('User already exists with this ID', 409);
        const student = await studentService.addStudent(studentData);
        const newUser = new User({
            _id: userId,
            role: 'student',
            instructor: null,
            student: student._id,
        });
        await newUser.save();

        return student;
    }

    // Register as Instructor
    async registerAsInstructor(userId: string, instructorData: Omit<IInstructor, '_id'>): Promise<IInstructor> {
        if (await this.isExists(userId)) throw new AppError('User already exists with this ID', 409);
        const instructor = await instructorService.addInstructor(instructorData);

        const newUser = new User({
            _id: userId,
            role: 'instructor',
            instructor: instructor._id,
            student: null,
        });
        await newUser.save();

        return instructor;
    }

    // Get user state based on userId
    async getUserState(userId: string): Promise<{ state: number; details: IStudent | IInstructor | null }> {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            // User not found, state 0
            return {state: 0, details: null};
        }

        // Determine the state and fetch details based on the role
        if (user.role === 'student' && user.student) {
            const student = await studentService.getStudentById(user.student.toString());
            return {state: 1, details: student || null}; // Return student details
        } else if (user.role === 'instructor' && user.instructor) {
            const instructor = await instructorService.getInstructorById(user.instructor.toString());
            return {state: 2, details: instructor || null}; // Return instructor details
        }

        // User is registered but no associated role ID
        return {state: 0, details: null};
    }
}


export const userService = new UserService();
