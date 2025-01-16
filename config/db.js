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
exports.closeDBConnection = exports.connectDB = exports.stopDockerContainers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const child_process_1 = require("child_process");
const node_path_1 = __importDefault(require("node:path"));
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/swimming_scheduler';
const dockerComposePath = node_path_1.default.resolve(__dirname, './docker-compose.yml');
// Initialize data (if needed)
const initializeData = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Initializing database...');
    try {
        const conn = yield mongoose_1.default.connect(process.env.MONGO_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (err) {
        if (err instanceof Error) {
            // Narrowing the type of error
            console.error(`Error: ${err.message}`);
        }
        else {
            console.error('An unknown error occurred during database connection');
        }
        process.exit(1); // Exit the process with a failure code
    }
});
// Start Docker Compose
const runDockerCompose = () => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`docker-compose -f ${dockerComposePath} -p swimming_pool_project up -d`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error starting Docker Compose:', stderr);
                return reject(error);
            }
            console.log('Docker Compose started successfully:', stdout);
            resolve();
        });
    });
};
// Stop Docker container
const stopDockerContainers = () => {
    console.log(`Attempting to stop Docker containers using file: ${dockerComposePath}`);
    return new Promise((resolve, reject) => {
        const command = `docker-compose -f ${dockerComposePath} -p swimming_pool_project down`;
        console.log(`Executing command: ${command}`);
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error stopping Docker containers:', stderr);
                return reject(new Error(stderr));
            }
            console.log('Docker containers stopped successfully:', stdout);
            resolve();
        });
    });
};
exports.stopDockerContainers = stopDockerContainers;
// Clear the database by dropping all collections
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongoose_1.default.connection.db;
    if (!db) {
        console.error('Database connection is not established. Cannot clear the database.');
        return;
    }
    try {
        const collections = yield db.listCollections().toArray();
        for (const collection of collections) {
            yield db.collection(collection.name).drop();
            console.log(`Dropped collection: ${collection.name}`);
        }
        console.log('All collections dropped successfully.');
    }
    catch (err) {
        console.error('Error clearing the database:', err instanceof Error ? err.message : err);
    }
});
// Connect to MongoDB (Docker or Atlas)
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting Docker Compose for MongoDB...');
        yield runDockerCompose();
        console.log('Connecting to MongoDB...');
        yield mongoose_1.default.connect(mongoURI);
        console.log('MongoDB connected successfully');
        console.log('Clearing the database...');
        yield clearDatabase();
        console.log('Initializing database...');
        yield initializeData();
        console.log('Database initialization complete');
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error setting up the database:', err.message);
        }
        else {
            console.error('An unknown error occurred during database setup');
        }
        process.exit(1); // Exit on failure
    }
});
exports.connectDB = connectDB;
// Graceful Shutdown for MongoDB
const closeDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Closing MongoDB connection...');
        yield mongoose_1.default.connection.close();
        console.log('MongoDB connection closed');
    }
    catch (err) {
        console.error('Error closing MongoDB connection:', err instanceof Error ? err.message : err);
    }
    try {
        console.log('Stopping Docker container...');
        yield (0, exports.stopDockerContainers)();
    }
    catch (err) {
        console.error('Error stopping Docker container:', err instanceof Error ? err.message : err);
    }
});
exports.closeDBConnection = closeDBConnection;
