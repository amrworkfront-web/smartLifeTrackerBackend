const express = require('express');
const router = express.Router();
const {
    getTopics,
    createTopic,
    createSession,
} = require('../controllers/learningController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/topics')
    .get(protect, getTopics)
    .post(protect, createTopic);

router.post('/sessions', protect, createSession);

module.exports = router;
