import mongoose from 'mongoose';
import {Student} from "../models/student";
import {Instructor} from "../models/instructor";



// Connect to MongoDB Atlas and clear the database
export const connectDBAtlas = async (): Promise<void> => {
    try {
        const mongoAtlasURI: string | undefined = process.env.MONGO_ATLAS_URI;

        if (!mongoAtlasURI) {
            console.error('Error setting up MongoDB Atlas:' +
                'MONGO_ATLAS_URI is not defined in the environment variables');
            process.exit(1); // Exit on failure
        }
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoAtlasURI);
        console.log('MongoDB Atlas connected successfully');
        console.log('Clearing the database...');
        await clearDatabase();
        console.log('Database cleared successfully');
        console.log('Initializing the database...');
        await initDatabase(); // Initialize with instructors and student
        console.log('Database initialized successfully');
    } catch (err: any) {
        console.error('Error setting up MongoDB Atlas:', err.message);
        process.exit(1); // Exit on failure
    }
};

// Clear the database by dropping all collections
const clearDatabase = async (): Promise<void> => {
    const db = mongoose.connection.db;

    if (!db) {
        console.error('Error: No database connection established. Ensure MongoDB is connected before clearing the database.');
        return;
    }

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
        console.log(`Dropping collection: ${collection.name}`);
        await db.collection(collection.name).drop();
    }
};
// Close MongoDB Atlas connection
export const closeDBAtlasConnection = async (): Promise<void> => {
    try {
        console.log('Closing MongoDB Atlas connection...');
        await mongoose.connection.close();
        console.log('MongoDB Atlas connection closed');
    } catch (err: any) {
        console.error('Error closing MongoDB Atlas connection:', err.message);
    }
};

const initDatabase = async (): Promise<void> => {
    try {
        console.log('Initializing database with instructors and students...');

        // Instructors
        const instructors = [
            {
                name: 'Yotam',
                availableHours: [
                    { day: 'Monday', start: '16:00', end: '20:00' },
                    { day: 'Thursday', start: '16:00', end: '20:00' },
                ],
                expertise: ['freestyle', 'breaststroke', 'butterfly', 'backstroke'],
            },
            {
                name: 'Yoni',
                availableHours: [
                    { day: 'Tuesday', start: '08:00', end: '15:00' },
                    { day: 'Wednesday', start: '08:00', end: '15:00' },
                    { day: 'Thursday', start: '08:00', end: '15:00' },
                ],
                expertise: ['breaststroke', 'butterfly'],
            },
            {
                name: 'Johnny',
                availableHours: [
                    { day: 'Sunday', start: '10:00', end: '19:00' },
                    { day: 'Tuesday', start: '10:00', end: '19:00' },
                    { day: 'Thursday', start: '10:00', end: '19:00' },
                ],
                expertise: ['freestyle', 'breaststroke', 'butterfly', 'backstroke'],
            },
        ];

        // Add instructors to the database
        for (const instructorData of instructors) {
            const instructor = new Instructor(instructorData);
            await instructor.save();
            console.log(`Added instructor: ${instructor.name}`);
        }

        // Students
        const lessonPreferences = [
            'private',
            'group',
            'both_prefer_private',
            'both_prefer_group',
        ];

        const students = Array.from({ length: 30 }, (_, index) => ({
            firstName: `Student${index + 1}`,
            lastName: `LastName${index + 1}`,
            preferredStyles: ['freestyle', 'breaststroke', 'butterfly', 'backstroke'],
            lessonPreference: lessonPreferences[index % lessonPreferences.length], // Cycle through preferences
        }));

        // Add students to the database
        for (const studentData of students) {
            const student = new Student(studentData);
            await student.save();
            console.log(`Added student: ${student.firstName} ${student.lastName} with preference: ${student.lessonPreference}`);
        }

        console.log('Database initialization completed.');
    } catch (error: any) {
        console.error('Error initializing the database:', error.message);
        throw error;
    }
};
