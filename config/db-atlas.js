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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDBAtlasConnection = exports.connectDBAtlas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const student_1 = require("../models/student");
const instructor_1 = require("../models/instructor");
// Connect to MongoDB Atlas and clear the database
const connectDBAtlas = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoAtlasURI = process.env.MONGO_ATLAS_URI;
        if (!mongoAtlasURI) {
            console.error('Error setting up MongoDB Atlas:' +
                'MONGO_ATLAS_URI is not defined in the environment variables');
            process.exit(1); // Exit on failure
        }
        console.log('Connecting to MongoDB Atlas...');
        yield mongoose_1.default.connect(mongoAtlasURI);
        console.log('MongoDB Atlas connected successfully');
        console.log('Clearing the database...');
        yield clearDatabase();
        console.log('Database cleared successfully');
        console.log('Initializing the database...');
        yield initDatabase(); // Initialize with instructors and student
        console.log('Database initialized successfully');
    }
    catch (err) {
        console.error('Error setting up MongoDB Atlas:', err.message);
        process.exit(1); // Exit on failure
    }
});
exports.connectDBAtlas = connectDBAtlas;
// Clear the database by dropping all collections
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongoose_1.default.connection.db;
    if (!db) {
        console.error('Error: No database connection established. Ensure MongoDB is connected before clearing the database.');
        return;
    }
    const collections = yield db.listCollections().toArray();
    for (const collection of collections) {
        console.log(`Dropping collection: ${collection.name}`);
        yield db.collection(collection.name).drop();
    }
});
// Close MongoDB Atlas connection
const closeDBAtlasConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Closing MongoDB Atlas connection...');
        yield mongoose_1.default.connection.close();
        console.log('MongoDB Atlas connection closed');
    }
    catch (err) {
        console.error('Error closing MongoDB Atlas connection:', err.message);
    }
});
exports.closeDBAtlasConnection = closeDBAtlasConnection;
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
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
            const instructor = new instructor_1.Instructor(instructorData);
            yield instructor.save();
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
            const student = new student_1.Student(studentData);
            yield student.save();
            console.log(`Added student: ${student.firstName} ${student.lastName} with preference: ${student.lessonPreference}`);
        }
        console.log('Database initialization completed.');
    }
    catch (error) {
        console.error('Error initializing the database:', error.message);
        throw error;
    }
});
