import { User, IUser } from '../models/user';
import { Student, IStudent } from '../models/student';
import { Instructor, IInstructor } from '../models/instructor';

class UserService {
    // Register User
    async registerUser(userId: string, role: 'student' | 'instructor' | 'admin'): Promise<IUser> {
        const existingUser = await User.findById(userId);

        if (existingUser) {
            throw new Error('User already exists.');
        }

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
}

export const userService = new UserService();
