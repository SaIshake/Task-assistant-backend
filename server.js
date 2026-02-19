import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeAI } from './config/ai.js';
import agentRoutes from './routes/agent.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Routes
 */
app.use('/api/agent', agentRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Task Assistant Agent API',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/agent/chat',
            tasks: 'GET /api/agent/tasks',
            status: 'GET /api/agent/status'
        }
    });
});

/**
 * Error Handling Middleware
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

/**
 * Initialize Services and Start Server
 */
async function startServer() {
    try {
        // 1. Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        }); console.log('✓ MongoDB connected successfully');

        // 2. Initialize AI client
        console.log('🤖 Initializing AI client...');
        initializeAI();

        // 3. Start Express server
        app.listen(PORT, () => {
            console.log(`\n✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Agent ready to process requests\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
    process.exit(0);
});

// Start the server
startServer();
