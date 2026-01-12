const mongoose = require('mongoose');

const learningTopicSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a topic title']
    },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'CS'],
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningTopic', learningTopicSchema);
