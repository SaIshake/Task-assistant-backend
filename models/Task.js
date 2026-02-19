import mongoose from 'mongoose';

/**
 * Task Schema
 * Represents a task stored in the agent's memory (MongoDB)
 */
const taskSchema = new mongoose.Schema({
  // Main task information
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  
  // When the task should be done
  date: {
    type: Date,
    required: true
  },
  
  // AI-generated advice for the task
  advice: {
    type: String,
    default: ''
  },
  
  // Additional notes or context
  notes: {
    type: String,
    default: ''
  },
  
  // Task completion status
  completed: {
    type: Boolean,
    default: false
  },
  
  // When the task was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
taskSchema.index({ date: 1 });        // For date-based queries
taskSchema.index({ createdAt: -1 });  // For retrieving recent tasks

// Create and export the model
const Task = mongoose.model('Task', taskSchema);

export default Task;
