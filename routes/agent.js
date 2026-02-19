import express from 'express';
import agent from '../agent/Agent.js';
import { getTasks, updateTask, deleteTask } from '../agent/tools.js';

const router = express.Router();

/**
 * POST /api/agent/chat
 * Main chat endpoint - processes user messages through the agent
 */
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Message is required and must be a non-empty string'
            });
        }

        // Process message through agent
        const response = await agent.process(message.trim());

        // Return response
        res.json(response);
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process your message. Please try again.'
        });
    }
});

/**
 * GET /api/agent/tasks
 * Retrieve all tasks with optional filters
 */
router.get('/tasks', async (req, res) => {
    try {
        const { completed, dateFrom, dateTo } = req.query;

        // Build filters
        const filters = {};
        if (completed !== undefined) {
            filters.completed = completed === 'true';
        }
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;

        // Get tasks
        const tasks = await getTasks(filters);

        res.json({
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            error: 'Failed to retrieve tasks'
        });
    }
});

/**
 * PATCH /api/agent/tasks/:id
 * Update a task (e.g., mark as completed)
 */
router.patch('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate updates
        const allowedUpdates = ['completed', 'title', 'date', 'notes'];
        const requestedUpdates = Object.keys(updates);
        const isValidOperation = requestedUpdates.every(update =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({
                error: 'Invalid updates',
                allowedFields: allowedUpdates
            });
        }

        // Update task
        const task = await updateTask(id, updates);

        res.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            error: 'Failed to update task'
        });
    }
});

/**
 * DELETE /api/agent/tasks/:id
 * Delete a task
 */
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await deleteTask(id);

        res.json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            error: 'Failed to delete task'
        });
    }
});

/**
 * GET /api/agent/status
 * Health check endpoint
 */
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        agent: 'Task Assistant Agent',
        version: '1.0.0'
    });
});

export default router;
