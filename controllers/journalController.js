const asyncHandler = require('../utils/asyncHandler');
const Journal = require('../models/Journal');

const getJournals = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.user.id };

    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [journals, total] = await Promise.all([
        Journal.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Journal.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: journals,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

const createJournal = asyncHandler(async (req, res) => {
    const { title, mood, content } = req.body;

    if (!title || !mood || !content) {
        res.status(400);
        throw new Error('Title, mood, and content are required');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await Journal.findOne({
        userId: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingEntry) {
        res.status(409);
        throw new Error('Journal entry for today already exists');
    }

    const journal = await Journal.create({
        userId: req.user.id,
        title,
        mood,
        content,
    });

    res.status(201).json({ success: true, data: journal });
});

const updateJournal = asyncHandler(async (req, res) => {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
        res.status(404);
        throw new Error('Journal not found');
    }

    if (journal.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    journal.title = req.body.title ?? journal.title;
    journal.mood = req.body.mood ?? journal.mood;
    journal.content = req.body.content ?? journal.content;

    const updatedJournal = await journal.save();
    res.status(200).json({ success: true, data: updatedJournal });
});

const deleteJournal = asyncHandler(async (req, res) => {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
        res.status(404);
        throw new Error('Journal not found');
    }

    if (journal.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    await journal.deleteOne();

    res.status(200).json({ success: true, data: { id: req.params.id } });
});

module.exports = {
    getJournals,
    createJournal,
    updateJournal,
    deleteJournal,
};
