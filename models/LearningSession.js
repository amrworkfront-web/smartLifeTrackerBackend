const mongoose = require('mongoose');

const learningSessionSchema = mongoose.Schema({
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'LearningTopic'
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningSession', learningSessionSchema);
