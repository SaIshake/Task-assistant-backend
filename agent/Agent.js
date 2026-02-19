import { sendMessage } from '../config/ai.js';
import { getClassificationPrompt, getConversationalPrompt } from './prompts.js';
import { extractTaskInfo, saveTask, generateAdvice } from './tools.js';

/**
 * AI Agent Core
 * Implements the multi-step agent pipeline:
 * STEP 1: Analyze user input
 * STEP 2: Classify (task vs non-task)
 * STEP 3: Execute tools (if task)
 * STEP 4: Generate response
 */

class Agent {
    constructor() {
        this.name = 'Task Assistant Agent';
    }

    /**
     * Main agent processing method
     * @param {string} userMessage - The user's message
     * @returns {Promise<Object>} - Agent response {message, task, advice}
     */
    async process(userMessage) {
        console.log('\n🤖 Agent processing:', userMessage);

        try {
            // STEP 1 & 2: Analyze and Classify
            const classification = await this.classify(userMessage);

            if (classification.isTask) {
                // STEP 3: Execute tools for task
                return await this.handleTask(userMessage);
            } else {
                // STEP 3: Generate conversational response
                return await this.handleConversation(userMessage);
            }
        } catch (error) {
            console.error('Agent error:', error);
            return {
                message: 'I apologize, but I encountered an error processing your request. Please try again.',
                error: true
            };
        }
    }

    /**
     * STEP 1 & 2: Classify user message
     * Determines if the message contains a task
     * @param {string} userMessage - The user's message
     * @returns {Promise<Object>} - {isTask, confidence}
     */
    async classify(userMessage) {
        console.log('📊 Step 1-2: Analyzing and classifying...');

        try {
            const prompt = getClassificationPrompt();
            const response = await sendMessage(prompt, userMessage, true);

            const classification = JSON.parse(response);
            console.log('✓ Classification:', classification);

            return classification;
        } catch (error) {
            console.error('Classification error:', error);
            // Default to non-task if classification fails
            return { isTask: false, confidence: 0 };
        }
    }

    /**
     * STEP 3 & 4: Handle task message
     * Executes tools and generates response
     * @param {string} userMessage - The user's message
     * @returns {Promise<Object>} - Response with task and advice
     */
    async handleTask(userMessage) {
        console.log('🔧 Step 3: Executing tools for task...');

        try {
            // Tool 1: Extract task information
            const taskInfo = await extractTaskInfo(userMessage);

            // Tool 2: Generate advice
            const advice = await generateAdvice(taskInfo.title);
            taskInfo.advice = advice;

            // Tool 3: Save to database
            const savedTask = await saveTask(taskInfo);

            // STEP 4: Generate response
            console.log('💬 Step 4: Generating response...');

            const formattedDate = this.formatDate(savedTask.date);

            const response = {
                message: `✓ I've added "${savedTask.title}" to your tasks for ${formattedDate}.\n\n${advice}`,
                task: {
                    id: savedTask._id,
                    title: savedTask.title,
                    date: savedTask.date,
                    notes: savedTask.notes,
                    advice: savedTask.advice
                },
                isTask: true
            };

            console.log('✓ Agent completed successfully');
            return response;
        } catch (error) {
            console.error('Task handling error:', error);
            throw error;
        }
    }

    /**
     * STEP 3 & 4: Handle conversational message
     * Generates a friendly response for non-task messages
     * @param {string} userMessage - The user's message
     * @returns {Promise<Object>} - Conversational response
     */
    async handleConversation(userMessage) {
        console.log('💬 Step 3-4: Generating conversational response...');

        try {
            const prompt = getConversationalPrompt();
            const response = await sendMessage(prompt, userMessage, false);

            console.log('✓ Agent completed successfully');

            return {
                message: response,
                isTask: false
            };
        } catch (error) {
            console.error('Conversation error:', error);
            return {
                message: "Hello! I'm your task assistant. I can help you remember things and manage your tasks. Try saying something like 'Remind me to study tomorrow'!",
                isTask: false
            };
        }
    }

    /**
     * Helper: Format date for display
     * @param {Date} date - Date object
     * @returns {string} - Formatted date string
     */
    formatDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const taskDate = new Date(date);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
            return 'today';
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            return 'tomorrow';
        } else {
            return taskDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// Export a singleton instance
export default new Agent();
