const asyncHandler = require('../utils/asyncHandler');
const Note = require('../models/Note');

// @desc    Get all notes
// @route   GET /notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
});

// @desc    Create a new note
// @route   POST /notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
    const { title, content, tag } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Please add title and content');
    }

    const note = await Note.create({
        userId: req.user.id,
        title,
        content,
        tag
    });

    res.status(201).json(note);
});

// @desc    Update a note
// @route   PUT /notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    res.status(200).json(updatedNote);
});

// @desc    Delete a note
// @route   DELETE /notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await note.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
