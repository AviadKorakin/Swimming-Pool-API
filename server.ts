import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import { connectDBAtlas, closeDBAtlasConnection } from './config/db-atlas';
import { closeServer } from './utils/server-utils';
import { setupSwagger } from './config/swagger';
import { clerkMiddleware } from '@clerk/express';
import studentRoutes from './routes/studentRoutes';
import instructorRoutes from './routes/instructorRoutes';
import lessonRoutes from './routes/lessonRoutes';
import userRoutes from './routes/userRoutes';
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 5000;

let server: any; // To store the server instance

app.use(cors());
// Parse JSON request body
app.use(express.json());


// Add Clerk middleware for authentication
app.use(clerkMiddleware());

// Middleware to log details of every request
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    // Log auth if available
    if (req.auth.userId) {
        console.log('Auth Object:', req.auth.userId);
    } else {
        console.log('Auth Object: Not available');
    }

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
        console.log('Query Params:', req.query);
    } else {
        console.log('Query Params: None');
    }

    // Log route parameters
    if (Object.keys(req.params).length > 0) {
        console.log('Route Params:', req.params);
    } else {
        console.log('Route Params: None');
    }

    // Log body if available
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    } else {
        console.log('Request Body: None');
    }

    next();
});


// Async route wrapper for error forwarding
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};


// Initialize Routes
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);


// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err);

    // Respond with the error details
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });
});

// Setup Swagger UI
setupSwagger(app);

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
        await connectDBAtlas(); // Connect to the database using the new function

        console.log('Starting Express server...');
        server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start the server:', err instanceof Error ? err.message : err);
        process.exit(1); // Exit the process if there’s an error
    }
};

/**
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server and MongoDB connection...');
    try {
        if (server) await closeServer(server); // Close the Express server
        await closeDBAtlasConnection(); // Close MongoDB Atlas connection

        console.log('Cleanup complete. Exiting...');
        process.exit(0); // Exit the process gracefully
    } catch (err) {
        console.error('Error during cleanup:', err instanceof Error ? err.message : err);
        process.exit(1); // Exit with failure
    }
});

// Start the server
startServer().then(() => console.log('Server initialized successfully'));
