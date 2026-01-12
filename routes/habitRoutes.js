const express = require('express');
const router = express.Router();
const {
    getHabits,
    createHabit,
    logHabit,
    getHabitStats,
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);

router.post('/:id/log', protect, logHabit);
router.get('/stats', protect, getHabitStats);

module.exports = router;
