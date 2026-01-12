const asyncHandler = require('../utils/asyncHandler');
const Journal = require('../models/Journal');

// @desc    Get journal entry for today
// @route   GET /journal/today
// @access  Private
const getTodayJournal = asyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const journal = await Journal.findOne({
        userId: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json(journal || null);
});

// @desc    Get all journal entries
// @route   GET /journal
// @access  Private
const getJournals = asyncHandler(async (req, res) => {
    const journals = await Journal.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json(journals);
});

// @desc    Create a new journal entry
// @route   POST /journal
// @access  Private
const createJournal = asyncHandler(async (req, res) => {
    const { title, mood, content } = req.body;

    if (!title || !mood || !content) {
        res.status(400);
        throw new Error('Title, mood, and content are required');
    }

    // Prevent more than one journal per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await Journal.findOne({
        userId: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingEntry) {
        res.status(400);
        throw new Error('Journal entry for today already exists');
    }

    const journal = await Journal.create({
        userId: req.user.id,
        title,
        mood,
        content
    });

    res.status(201).json(journal);
});

// @desc    Update journal entry
// @route   PUT /journal/:id
// @access  Private
const updateJournal = asyncHandler(async (req, res) => {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
        res.status(404);
        throw new Error('Journal not found');
    }

    if (journal.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    journal.title = req.body.title ?? journal.title;
    journal.mood = req.body.mood ?? journal.mood;
    journal.content = req.body.content ?? journal.content;

    const updatedJournal = await journal.save();
    res.status(200).json(updatedJournal);
});


module.exports = {
    getTodayJournal,
    getJournals,
    createJournal,
    updateJournal,
};
