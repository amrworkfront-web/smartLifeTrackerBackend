const mongoose = require('mongoose');

const journalSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split('T')[0],
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
        },
        mood: {
            type: String,
            enum: ['Happy', 'Neutral', 'Sad'],
            required: [true, 'Please select a mood'],
        },
        content: {
            type: String,
            required: [true, 'Please add content'],
        },
    },
    {
        timestamps: true,
    }
);

journalSchema.index({ userId: 1, date: 1 }, { unique: true });
journalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', journalSchema);
