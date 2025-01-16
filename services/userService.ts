import { User, IUser } from '../models/user';
import { Student, IStudent } from '../models/student';
import { Instructor, IInstructor } from '../models/instructor';

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
        const user = await User.findById(userId);
        if (!user || user.role !== 'student') {
            throw new Error('User must have a role of student to register as student.');
        }

        const student = new Student(studentData);
        await student.save();

        user.student = student._id;
        await user.save();

        return student;
    }

    // Register as Instructor
    async registerAsInstructor(userId: string, instructorData: Omit<IInstructor, '_id'>): Promise<IInstructor> {
        const user = await User.findById(userId);
        if (!user || user.role !== 'instructor') {
            throw new Error('User must have a role of instructor to register as instructor.');
        }

        const instructor = new Instructor(instructorData);
        await instructor.save();

        user.instructor = instructor._id;
        await user.save();

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
