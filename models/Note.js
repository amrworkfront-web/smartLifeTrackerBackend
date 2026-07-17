const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a note title'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Please add content'],
        },
        tag: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
