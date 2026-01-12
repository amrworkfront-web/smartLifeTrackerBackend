const asyncHandler = require('../utils/asyncHandler');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

/* =====================================================
   @desc    Get all habits for user
   @route   GET /habits
   @access  Private
===================================================== */
const getHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(habits);
});

/* =====================================================
   @desc    Create new habit
   @route   POST /habits
   @access  Private
===================================================== */
const createHabit = asyncHandler(async (req, res) => {
    const { name, type, meta } = req.body;

    if (!name || !type) {
        res.status(400);
        throw new Error('Habit name and type are required');
    }

    // Validate habit type
    const allowedTypes = ['boolean', 'counter', 'checklist', 'session'];
    if (!allowedTypes.includes(type)) {
        res.status(400);
        throw new Error('Invalid habit type');
    }

    const habit = await Habit.create({
        userId: req.user.id,
        name,
        type,
        meta: meta || {}
    });

    res.status(201).json(habit);
});

/* =====================================================
   @desc    Log habit (daily tracking)
   @route   POST /habit-logs
   @access  Private
===================================================== */
const logHabit = asyncHandler(async (req, res) => {
    const { habitId, date, value, checklist } = req.body;

    if (!habitId || !date) {
        res.status(400);
        throw new Error('habitId and date are required');
    }

    const habit = await Habit.findById(habitId);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    /**
     * Log behavior by habit type:
     * - boolean   → value: true/false
     * - counter   → value: number
     * - checklist → checklist: { key: boolean }
     * - session   → value: minutes
     */

    const updateData = {
        habitId,
        date,
    };

    if (habit.type === 'checklist') {
        updateData.checklist = checklist || {};
    } else {
        updateData.value = value;
    }

    const log = await HabitLog.findOneAndUpdate(
        { habitId, date },
        updateData,
        { new: true, upsert: true }
    );

    res.status(200).json(log);
});

/* =====================================================
   @desc    Get habit logs by habitId & date range
   @route   GET /habit-logs/:habitId
   @access  Private
===================================================== */
const getHabitLogs = asyncHandler(async (req, res) => {
    const { habitId } = req.params;
    const { from, to } = req.query;

    const habit = await Habit.findById(habitId);
    if (!habit || habit.userId.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Habit not found');
    }

    const query = { habitId };

    if (from || to) {
        query.date = {};
        if (from) query.date.$gte = from;
        if (to) query.date.$lte = to;
    }

    const logs = await HabitLog.find(query).sort({ date: 1 });
    res.status(200).json(logs);
});

/* =====================================================
   @desc    Get habits stats (last 30 days)
   @route   GET /habits/stats
   @access  Private
===================================================== */
const getHabitStats = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ userId: req.user.id }).select('_id');
    const habitIds = habits.map(h => h._id);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = fromDate.toISOString().split('T')[0];

    const logs = await HabitLog.find({
        habitId: { $in: habitIds },
        date: { $gte: from }
    });

    res.status(200).json(logs);
});

module.exports = {
    getHabits,
    createHabit,
    logHabit,
    getHabitLogs,
    getHabitStats,
};
