import { User, IUser } from '../models/user';
import { IStudent } from '../models/student';
import { IInstructor } from '../models/instructor';
import {studentService} from './studentService';
import {instructorService} from "./instructorService";

class UserService {

    async isExists(userId: string): Promise<boolean> {
        return await User.exists({ _id: userId }) !== null;
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
        if(await this.isExists(userId)) throw Error("user exists already registered");
        const student  = await studentService.addStudent(studentData);
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
        if(await this.isExists(userId)) throw Error("user exists already registered");
        const instructor =  await instructorService.addInstructor(instructorData);

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
    async getUserState(userId: string): Promise<{ state: number; id: string | null }> {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            // User not found, state 0
            return { state: 0, id: null };
        }

        // Determine the state and ID based on the role
        if (user.role === 'student' && user.student) {
            return { state: 1, id: user.student.toString() };
        } else if (user.role === 'instructor' && user.instructor) {
            return { state: 2, id: user.instructor.toString() };
        }

        // User is registered but no associated role ID
        return { state: 0, id: null };
    }
}



export const userService = new UserService();
