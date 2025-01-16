import { Response,Request } from 'express';
import { studentService } from '../services/studentService';
import { IStudent, StudentFilter } from '../models/student';

// Add a student
export const addStudent = async (
    req: Request<{}, {}, Omit<IStudent,'_id'>>,
    res: Response<IStudent | { error: string }>,
): Promise<void> => {
    try {
        const student = await studentService.addStudent(req.body);
        res.status(201).json(student);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Validation failed')) {
            res.status(400).json({ error: 'Invalid student data' });
        } else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add student' });
        }
    }
};

// Update a student
export const updateStudent = async (
    req: Request<{ id: string }, {}, Partial<IStudent>>,
    res: Response<IStudent | { error: string }>,
): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedStudent = await studentService.updateStudent(id, req.body);
        if (!updatedStudent) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.status(200).json(updatedStudent);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        } else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update student' });
        }
    }
};
export const getStudentById = async (
    req: Request<{ id: string }>,
    res: Response<IStudent | { error: string }>
): Promise<void> => {
    try {
        const { id } = req.params;

        // Fetch the student by ID
        const student = await studentService.getStudentById(id);

        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        res.status(200).json(student);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        } else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch student' });
        }
    }
};
// Delete a student
export const deleteStudent = async (
    req: Request<{ id: string }>,
    res: Response<{ message: string } | { error: string }>,
): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedStudent = await studentService.deleteStudent(id);
        if (!deletedStudent) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
            res.status(400).json({ error: 'Invalid student ID format' });
        } else {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete student' });
        }
    }
};

// Find matching students for a lesson
export const findMatchingStudents = async (
    req: Request<{}, {}, {}, { style: string; type: 'private' | 'group' }>,
    res: Response<IStudent[] | { error: string }>,
): Promise<void> => {
    try {
        const { style, type } = req.query;
        if (!style || !type) {
            res.status(400).json({ error: 'Style and type are required query parameters' });
            return;
        }

        const students = await studentService.findMatchingStudents(style, type);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to find matching students' });
    }
};

// List all students with optional filters and pagination
export const listStudents = async (
    req: Request<{}, {}, {}, { page?: string; limit?: string } & StudentFilter>,
    res: Response<{ students: IStudent[]; total: number } | { error: string }>,
): Promise<void> => {
    try {
        const { page = '1', limit = '10', ...filters } = req.query;

        if (isNaN(Number(page)) || isNaN(Number(limit))) {
            res.status(400).json({ error: 'Page and limit must be valid numbers' });
            return;
        }

        const filterConditions: StudentFilter = {
            firstName: filters.firstName,
            lastName: filters.lastName,
            preferredStyles: filters.preferredStyles,
            lessonPreference: filters.lessonPreference,
        };

        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);

        const studentsResult = await studentService.listStudents(filterConditions, numericPage, numericLimit);

        res.status(200).json({
            students: studentsResult.students,
            total: studentsResult.total,
        });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to retrieve students' });
    }
};
// Assign a student to a lesson
export const assignStudentToLesson = async (
    req: Request<{ lessonId: string; studentId: string }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const { lessonId, studentId } = req.params;
        await studentService.assignStudentToLesson(studentId, lessonId);
        res.status(200).json({ message: 'Student successfully assigned to the lesson.' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to assign student to the lesson' });
    }
};

// Remove a student from a lesson
export const removeStudentFromLesson = async (
    req: Request<{ lessonId: string; studentId: string }>,
    res: Response<{ message: string } | { error: string }>
): Promise<void> => {
    try {
        const { lessonId, studentId } = req.params;
        await studentService.removeStudentFromLesson(studentId, lessonId);
        res.status(200).json({ message: 'Student successfully removed from the lesson.' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove student from the lesson' });
    }
};