const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a task title'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium',
        },
        status: {
            type: Boolean,
            default: false,
        },
        deadline: {
            type: Date,
        },
        dueDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
