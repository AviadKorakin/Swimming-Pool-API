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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_atlas_1 = require("./config/db-atlas");
const server_utils_1 = require("./utils/server-utils");
const swagger_1 = require("./config/swagger");
const express_2 = require("@clerk/express");
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/instructorRoutes"));
const lessonRoutes_1 = __importDefault(require("./routes/lessonRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const lessonRequestRoutes_1 = __importDefault(require("./routes/lessonRequestRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
let server; // To store the server instance
app.use((0, cors_1.default)());
// Parse JSON request body
app.use(express_1.default.json());
// Add Clerk middleware for authentication
app.use((0, express_2.clerkMiddleware)());
// Middleware to log details of every request
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    // Log auth if available
    if (req.auth.userId) {
        console.log('Auth Object:', req.auth.userId);
    }
    else {
        console.log('Auth Object: Not available');
    }
    // Log query parameters
    if (Object.keys(req.query).length > 0) {
        console.log('Query Params:', req.query);
    }
    else {
        console.log('Query Params: None');
    }
    // Log route parameters
    if (Object.keys(req.params).length > 0) {
        console.log('Route Params:', req.params);
    }
    else {
        console.log('Route Params: None');
    }
    // Log body if available
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    else {
        console.log('Request Body: None');
    }
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});
// Initialize Routes
app.use('/api/students', studentRoutes_1.default);
app.use('/api/instructors', instructorRoutes_1.default);
app.use('/api/lessons', lessonRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/lesson-requests', lessonRequestRoutes_1.default);
// Setup Swagger UI
(0, swagger_1.setupSwagger)(app);
/**
 * Start the server
 */
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_atlas_1.connectDBAtlas)(); // Connect to the database using the new function
        console.log('Starting Express server...');
        server = app.listen(PORT, () => {
            console.log(`Server is running on https://swimming-pool-api.onrender.com`);
        });
        // Self-ping every 12 minutes
        const selfPingInterval = 12 * 60 * 1000; // 12 minutes in milliseconds
        setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Pinging server health endpoint...');
                const response = yield axios_1.default.get(`https://swimming-pool-api.onrender.com/health`);
                console.log('Ping response:', response.data);
            }
            catch (err) {
                console.error('Error pinging health endpoint:', err instanceof Error ? err.message : err);
            }
        }), selfPingInterval);
    }
    catch (err) {
        console.error('Failed to start the server:', err instanceof Error ? err.message : err);
        process.exit(1); // Exit the process if there’s an error
    }
});
/**
 * Graceful Shutdown
 */
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('SIGINT signal received: closing HTTP server and MongoDB connection...');
    try {
        if (server)
            yield (0, server_utils_1.closeServer)(server); // Close the Express server
        yield (0, db_atlas_1.closeDBAtlasConnection)(); // Close MongoDB Atlas connection
        console.log('Cleanup complete. Exiting...');
        process.exit(0); // Exit the process gracefully
    }
    catch (err) {
        console.error('Error during cleanup:', err instanceof Error ? err.message : err);
        process.exit(1); // Exit with failure
    }
}));
// Start the server
startServer().then(() => console.log('Server initialized successfully'));
