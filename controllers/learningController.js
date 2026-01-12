const asyncHandler = require('../utils/asyncHandler');
const LearningTopic = require('../models/LearningTopic');
const LearningSession = require('../models/LearningSession');

// @desc    Get all learning topics
// @route   GET /learning/topics
// @access  Private
const getTopics = asyncHandler(async (req, res) => {
    const topics = await LearningTopic.find({ userId: req.user.id });
    res.status(200).json(topics);
});

// @desc    Create a new learning topic
// @route   POST /learning/topics
// @access  Private
const createTopic = asyncHandler(async (req, res) => {
    const { title, category, status } = req.body;

    if (!title || !category) {
        res.status(400);
        throw new Error('Please add title and category');
    }

    const topic = await LearningTopic.create({
        userId: req.user.id,
        title,
        category,
        status
    });

    res.status(201).json(topic);
});

// @desc    Log a learning session
// @route   POST /learning/sessions
// @access  Private
const createSession = asyncHandler(async (req, res) => {
    const { topicId, duration, notes, date } = req.body;

    if (!topicId || !duration) {
        res.status(400);
        throw new Error('Please add topicId and duration');
    }

    // Verify ownership of the topic
    const topic = await LearningTopic.findById(topicId);
    if (!topic) {
        res.status(404);
        throw new Error('Topic not found');
    }

    if (topic.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const session = await LearningSession.create({
        topicId,
        duration,
        notes,
        date: date || Date.now()
    });

    res.status(201).json(session);
});

module.exports = {
    getTopics,
    createTopic,
    createSession,
};
