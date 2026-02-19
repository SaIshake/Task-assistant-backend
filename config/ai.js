import OpenAI from 'openai';

/**
 * AI Configuration
 * Abstraction layer for AI model interactions
 * Supports OpenAI (GPT) and Groq (free alternative)
 */

let aiClient = null;
let currentProvider = null;

/**
 * Initialize the AI client based on environment configuration
 */
export function initializeAI() {
    const provider = process.env.AI_PROVIDER || 'openai';
    currentProvider = provider;

    if (provider === 'openai') {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
        }

        aiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        console.log('✓ AI Client initialized: OpenAI');
    } else if (provider === 'groq') {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is required when using Groq provider');
        }

        // Groq uses OpenAI-compatible API
        aiClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
        });

        console.log('✓ AI Client initialized: Groq (Free & Fast!)');
    } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
}

/**
 * Send a message to the AI model and get a response
 * @param {string} systemPrompt - The system instruction for the AI
 * @param {string} userMessage - The user's message
 * @param {boolean} jsonMode - Whether to expect JSON response
 * @returns {Promise<string>} - The AI's response
 */
export async function sendMessage(systemPrompt, userMessage, jsonMode = false) {
    if (!aiClient) {
        throw new Error('AI client not initialized. Call initializeAI() first.');
    }

    // Get model based on provider
    let model;
    if (currentProvider === 'groq') {
        model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    } else {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    }

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];

        const params = {
            model: model,
            messages: messages,
            temperature: 0.7
        };

        // Enable JSON mode if requested (for structured outputs)
        if (jsonMode) {
            params.response_format = { type: 'json_object' };
        }

        const response = await aiClient.chat.completions.create(params);

        return response.choices[0].message.content;
    } catch (error) {
        console.error('AI API Error:', error.message);
        throw new Error(`AI request failed: ${error.message}`);
    }
}

/**
 * Get the current AI provider name
 */
export function getProvider() {
    return currentProvider || process.env.AI_PROVIDER || 'openai';
}
