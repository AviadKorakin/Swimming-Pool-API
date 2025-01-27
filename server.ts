import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectDBAtlas, closeDBAtlasConnection } from './config/db-atlas';
import { closeServer } from './utils/server-utils';
import { setupSwagger } from './config/swagger';
import { clerkMiddleware } from '@clerk/express';
import studentRoutes from './routes/studentRoutes';
import instructorRoutes from './routes/instructorRoutes';
import lessonRoutes from './routes/lessonRoutes';
import userRoutes from './routes/userRoutes';
import cors from 'cors'
import axios from 'axios';
import lessonRequestRoutes from "./routes/lessonRequestRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

let server: any; // To store the server instance

// Create the HTTP server
const httpServer = http.createServer(app);

app.use(cors());
// Parse JSON request body
app.use(express.json());

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins; adjust as needed for security
        methods: ['GET', 'POST'],
    },
    transports: ["websocket", "polling"],
});

// Socket.IO middleware for logging new connections
io.use((socket, next) => {
    console.log(`New Socket.IO connection: ${socket.id}`);
    next();
});

// Handle Socket.IO events
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });

    // Optional: Example of a custom event
    socket.on('custom-event', (data) => {
        console.log('Received custom event:', data);
        socket.emit('response-event', { message: 'Hello from the server!' });
    });
});


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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Initialize Routes
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes)
app.use('/api/lesson-requests', lessonRequestRoutes);

// Setup Swagger UI
setupSwagger(app);

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
        await connectDBAtlas(); // Connect to the database using the new function

        console.log('Starting Express server...');
        server=httpServer.listen(PORT, () => {
            console.log(`Server is running on https://swimming-pool-api.onrender.com`);
        });
        // Self-ping every 12 minutes
        const selfPingInterval = 12 * 60 * 1000; // 12 minutes in milliseconds
        setInterval(async () => {
            try {
                console.log('Pinging server health endpoint...');
                const response = await axios.get(`https://swimming-pool-api.onrender.com/health`);
                console.log('Ping response:', response.data);
            } catch (err) {
                console.error('Error pinging health endpoint:', err instanceof Error ? err.message : err);
            }
        }, selfPingInterval);
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

// Export the io instance for use in other files
export { io };
