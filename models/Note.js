const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a note title']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    tag: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
