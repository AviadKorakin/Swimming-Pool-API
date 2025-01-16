import mongoose from 'mongoose';
import { exec } from 'child_process';
import path from "node:path";

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/swimming_scheduler';
const dockerComposePath = path.resolve(__dirname, './docker-compose.yml');
// Initialize data (if needed)
const initializeData = async () => {
    console.log('Initializing database...');
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        if (err instanceof Error) {
            // Narrowing the type of error
            console.error(`Error: ${err.message}`);
        } else {
            console.error('An unknown error occurred during database connection');
        }
        process.exit(1); // Exit the process with a failure code
    }
};

// Start Docker Compose
const runDockerCompose = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        exec(`docker-compose -f ${dockerComposePath} -p swimming_pool_project up -d`, (error, stdout, stderr) => {
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
export const stopDockerContainers = (): Promise<void> => {
    console.log(`Attempting to stop Docker containers using file: ${dockerComposePath}`);
    return new Promise<void>((resolve, reject) => {
        const command = `docker-compose -f ${dockerComposePath} -p swimming_pool_project down`;
        console.log(`Executing command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error stopping Docker containers:', stderr);
                return reject(new Error(stderr));
            }
            console.log('Docker containers stopped successfully:', stdout);
            resolve();
        });
    });
};
// Clear the database by dropping all collections
const clearDatabase = async (): Promise<void> => {
    const db = mongoose.connection.db;

    if (!db) {
        console.error('Database connection is not established. Cannot clear the database.');
        return;
    }

    try {
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`Dropped collection: ${collection.name}`);
        }
        console.log('All collections dropped successfully.');
    } catch (err) {
        console.error('Error clearing the database:', err instanceof Error ? err.message : err);
    }
};


// Connect to MongoDB (Docker or Atlas)
export const connectDB = async (): Promise<void> => {
    try {
        console.log('Starting Docker Compose for MongoDB...');
        await runDockerCompose();

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');

        console.log('Clearing the database...');
        await clearDatabase();

        console.log('Initializing database...');
        await initializeData();

        console.log('Database initialization complete');
    } catch (err) {
        if (err instanceof Error) {
            console.error('Error setting up the database:', err.message);
        } else {
            console.error('An unknown error occurred during database setup');
        }
        process.exit(1); // Exit on failure
    }
};


// Graceful Shutdown for MongoDB
export const closeDBConnection = async (): Promise<void> => {
    try {
        console.log('Closing MongoDB connection...');
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err instanceof Error ? err.message : err);
    }

    try {
        console.log('Stopping Docker container...');
        await stopDockerContainers();
    } catch (err) {
        console.error('Error stopping Docker container:', err instanceof Error ? err.message : err);
    }
};


