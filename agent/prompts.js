/**
 * AI Prompts
 * All prompts used by the agent in one place for easy modification
 */

/**
 * Classification Prompt
 * Determines if user message contains a task
 */
export function getClassificationPrompt() {
    return `You are a task classification AI. Analyze the user's message and determine if it contains a task.

A task is something the user wants to:
- Remember to do
- Be reminded about
- Schedule
- Track
- Complete in the future

Examples of TASKS:
- "Remind me to study networking tomorrow"
- "I need to call mom next week"
- "Add buy groceries to my list"
- "Schedule a meeting for Friday"

Examples of NOT TASKS:
- "What's the weather like?"
- "How are you?"
- "Tell me a joke"
- "What can you do?"

Respond with ONLY a JSON object in this exact format:
{
  "isTask": true or false,
  "confidence": 0.0 to 1.0
}`;
}

/**
 * Task Extraction Prompt
 * Extracts task details from user message
 */
export function getExtractionPrompt(currentDate) {
    return `Extract task information from the user's message.

Current date and time: ${currentDate}

Respond with ONLY a JSON object in this exact format:
{
  "title": "brief task description",
  "date": "YYYY-MM-DD format",
  "notes": "any additional context from the message"
}

Rules for date parsing:
- If no date mentioned, use today's date
- "tomorrow" = today + 1 day
- "next week" = today + 7 days
- "Monday", "Tuesday", etc. = next occurrence of that day
- Specific dates should be converted to YYYY-MM-DD format

Rules for title:
- Keep it concise (max 50 characters)
- Remove phrases like "remind me to", "I need to", etc.
- Just the core action

Example:
User: "Remind me to study networking tomorrow and give me tips"
Response: {
  "title": "Study networking",
  "date": "2026-01-14",
  "notes": "User wants tips for studying networking"
}`;
}

/**
 * Advice Generation Prompt
 * Generates helpful tips for a task
 */
export function getAdvicePrompt(taskTitle) {
    return `Generate helpful, actionable advice for the following task:

Task: "${taskTitle}"

Provide 3-5 specific tips that would help someone accomplish this task effectively.
Be concise, practical, and encouraging.
Format as a numbered list.

Example format:
1. First tip here
2. Second tip here
3. Third tip here`;
}

/**
 * Conversational Response Prompt
 * For non-task messages
 */
export function getConversationalPrompt() {
    return `You are a friendly and helpful task assistant AI. 

Your primary purpose is to help users manage their tasks and reminders.

The user's message is not a task. Respond naturally and helpfully.

If appropriate, offer to help them create a task or reminder.

Keep your response concise, friendly, and helpful.`;
}
