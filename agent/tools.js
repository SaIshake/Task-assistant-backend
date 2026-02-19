import Task from '../models/Task.js';
import { sendMessage } from '../config/ai.js';
import { getExtractionPrompt, getAdvicePrompt } from './prompts.js';

/**
 * Agent Tools
 * These are the "tools" the agent can use to accomplish tasks
 */

/**
 * Tool 1: Extract Task Information
 * Uses AI to parse user message and extract task details
 * @param {string} userMessage - The user's message
 * @returns {Promise<Object>} - Extracted task info {title, date, notes}
 */
export async function extractTaskInfo(userMessage) {
    try {
        const currentDate = new Date().toISOString();
        const prompt = getExtractionPrompt(currentDate);

        // Use AI to extract structured task information
        const response = await sendMessage(prompt, userMessage, true);

        // Parse the JSON response
        const taskInfo = JSON.parse(response);

        // Validate and convert date
        taskInfo.date = new Date(taskInfo.date);

        console.log('✓ Extracted task info:', taskInfo);
        return taskInfo;
    } catch (error) {
        console.error('Error extracting task info:', error);
        throw new Error('Failed to extract task information');
    }
}

/**
 * Tool 2: Save Task to Database
 * Stores the task in MongoDB
 * @param {Object} taskInfo - Task information {title, date, notes}
 * @returns {Promise<Object>} - Saved task document
 */
export async function saveTask(taskInfo) {
    try {
        const task = new Task({
            title: taskInfo.title,
            date: taskInfo.date,
            notes: taskInfo.notes || '',
            advice: taskInfo.advice || ''
        });

        const savedTask = await task.save();
        console.log('✓ Task saved to database:', savedTask._id);

        return savedTask;
    } catch (error) {
        console.error('Error saving task:', error);
        throw new Error('Failed to save task to database');
    }
}

/**
 * Tool 3: Get All Tasks
 * Retrieves tasks from database
 * @param {Object} filters - Optional filters {completed, dateRange}
 * @returns {Promise<Array>} - Array of tasks
 */
export async function getTasks(filters = {}) {
    try {
        const query = {};

        // Apply filters if provided
        if (filters.completed !== undefined) {
            query.completed = filters.completed;
        }

        if (filters.dateFrom || filters.dateTo) {
            query.date = {};
            if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
            if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
        }

        // Get tasks sorted by date (ascending) and creation time (descending)
        const tasks = await Task.find(query)
            .sort({ date: 1, createdAt: -1 })
            .lean();

        console.log(`✓ Retrieved ${tasks.length} tasks from database`);
        return tasks;
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        throw new Error('Failed to retrieve tasks from database');
    }
}

/**
 * Tool 4: Generate Advice
 * Uses AI to generate helpful tips for a task
 * @param {string} taskTitle - The task title
 * @returns {Promise<string>} - Generated advice
 */
export async function generateAdvice(taskTitle) {
    try {
        const prompt = getAdvicePrompt(taskTitle);

        // Use AI to generate helpful advice
        const advice = await sendMessage(prompt, '', false);

        console.log('✓ Generated advice for task:', taskTitle);
        return advice.trim();
    } catch (error) {
        console.error('Error generating advice:', error);
        // Return a fallback message if AI fails
        return 'Good luck with your task! Break it down into smaller steps and tackle them one at a time.';
    }
}

/**
 * Tool 5: Update Task
 * Updates an existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated task
 */
export async function updateTask(taskId, updates) {
    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new Error('Task not found');
        }

        console.log('✓ Task updated:', taskId);
        return task;
    } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
    }
}

/**
 * Tool 6: Delete Task
 * Deletes a task from database
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteTask(taskId) {
    try {
        const result = await Task.findByIdAndDelete(taskId);

        if (!result) {
            throw new Error('Task not found');
        }

        console.log('✓ Task deleted:', taskId);
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }
}
