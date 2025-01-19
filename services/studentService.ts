import {Student, IStudent, StudentFilter} from '../models/student';
import {Lesson} from "../models/lesson";
import {AppError} from "../errors/AppError";
class StudentService {

    // Add a new student
    async addStudent(studentData: Omit<IStudent,'_id'>): Promise<IStudent> {
        const uniqueNameData = await this.generateUniqueName(studentData.firstName, studentData.lastName);
        studentData.firstName = uniqueNameData.firstName;
        studentData.lastName = uniqueNameData.lastName;

        const student = new Student(studentData);
        return await student.save();
    }


    // Generate a unique first and last name for a new student
    private async generateUniqueName(firstName: string, lastName: string): Promise<{ firstName: string; lastName: string }> {
        let uniqueLastName = lastName;
        let counter = 1;

        // Query students with the same first name and last name
        const students = await Student.find({
            firstName,
            lastName: { $regex: `^${lastName}(\\s*\\(\\d+\\))?$` },
        });

        while (students.some((student) => student.lastName === uniqueLastName)) {
            uniqueLastName = `${lastName}(${counter})`;
            counter++;
        }

        return { firstName, lastName: uniqueLastName };
    }
// Update student details
    async updateStudent(studentId: string, updatedData: Partial<Omit<IStudent,'_id'>>): Promise<IStudent | null> {
        return Student.findByIdAndUpdate(studentId, updatedData, {new: true});
    }

    // Delete a student
    async deleteStudent(studentId: string): Promise<boolean> {
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        return !!deletedStudent; // Convert the result to a boolean
    }

    // Get a student by ID
    async getStudentById(studentId: string): Promise<IStudent | null> {
        return Student.findById(studentId);
    }

    async listStudents(
        filters: StudentFilter = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ students: IStudent[]; total: number }> {
        // Filter out undefined values
        const queryFilters: Record<string, any> = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );

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
        const total = await Student.countDocuments(queryFilters);
        const students = await Student.find(queryFilters)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { students, total };
    }







    // Find students matching lesson criteria
    async findMatchingStudents(
        style: string,
        type: 'private' | 'group'
    ): Promise<{ id: string; firstName: string; lastName: string, lessonPreference: string }[]> {
        const priorityOrder =
            type === 'private'
                ? ['private', 'both_prefer_private', 'both_prefer_group']
                : ['group', 'both_prefer_group', 'both_prefer_private'];

        const students = await Student.find(
            {
                preferredStyles: style,
                lessonPreference: { $in: priorityOrder }, // Filter students based on the priority list
            },
            { _id: 1, firstName: 1, lastName: 1, lessonPreference: 1 } // Fetch necessary fields
        )
            .exec();

        // Sort the students based on the priorityOrder
        const sortedStudents = students.sort(
            (a, b) =>
                priorityOrder.indexOf(a.lessonPreference) - priorityOrder.indexOf(b.lessonPreference)
        );

        // Map the `_id` to `id` and convert to string
        return sortedStudents.map((student) => ({
            id: student._id.toString(),
            firstName: student.firstName,
            lastName: student.lastName,
            lessonPreference : student.lessonPreference
        }));
    }
    // Assign a student to a lesson
    async assignStudentToLesson(studentId: string, lessonId: string): Promise<IStudent | null> {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new AppError('Lesson not found',404);
        }

        const student = await Student.findById(studentId);
        if (!student) {
            throw new AppError('Student not found',404);
        }

        // Check if the student is already assigned to the lesson
        if (lesson.students.some(id => id.toString() === student._id.toString())) {
            throw new AppError('Student is already assigned to this lesson',409);
        }

        // Ensure the lesson doesn't exceed its capacity
        const maxCapacity = lesson.type === 'group' ? 30 : 1; // 30 for group lessons, 1 for private lessons
        if (lesson.students.length >= maxCapacity) {
            throw new AppError(
                lesson.type === 'group'
                    ? 'Lesson is full (maximum 30 students allowed).'
                    : 'Private lesson already has a student.',409
            );
        }

        // Add the student to the lesson using their ObjectId
        lesson.students.push(student._id);
        await lesson.save();

        return student;
    }


    // Remove a student from a lesson
    async removeStudentFromLesson(studentId: string, lessonId: string): Promise<IStudent | null> {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new AppError('Lesson not found',404);
        }

        const student = await Student.findById(studentId);
        if (!student) {
            throw new AppError('Student not found',404);
        }

        // Check if the student is assigned to the lesson
        if (!lesson.students.some(id => id.toString() === student._id.toString())) {
            throw new AppError('Student is not assigned to this lesson',409);
        }

        // Remove the student from the lesson
        lesson.students = lesson.students.filter(id => id.toString() !== student._id.toString());
        await lesson.save();

        return student;
    }


}

export const studentService = new StudentService();
