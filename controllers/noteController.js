const asyncHandler = require('../utils/asyncHandler');
const Note = require('../models/Note');

const getNotes = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.user.id };

    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
        Note.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Note.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: notes,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

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
        tag,
    });

    res.status(201).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    const { title, content, tag } = req.body;

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (content !== undefined) updatedFields.content = content;
    if (tag !== undefined) updatedFields.tag = tag;

    const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedNote });
});

const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    await note.deleteOne();

    res.status(200).json({ success: true, data: { id: req.params.id } });
});

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
