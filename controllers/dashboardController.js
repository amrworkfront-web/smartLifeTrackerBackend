const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const HabitLog = require('../models/HabitLog');
const LearningSession = require('../models/LearningSession');

// @desc    Get dashboard stats
// @route   GET /dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Task Stats
    const totalTasks = await Task.countDocuments({ userId });
    const pendingTasks = await Task.countDocuments({ userId, status:false });
    const completedTasks = await Task.countDocuments({ userId, status:true });
    
    // Today's tasks (checking createdAt or just generic count depending on reqs. 
    // Requirement says "Today's tasks count", let's assume createdAt >= today)
    const tasksCreatedToday = await Task.countDocuments({ 
        userId, 
        createdAt: { $gte: today } 
    });

    // 2. Habits Completion Today
    const todayString = new Date().toISOString().split('T')[0];
    const habitsCompletedToday = await HabitLog.countDocuments({
        // We need to filter by habits belonging to user. 
        // HabitLog only has habitId. We must join or query habits first.
        // Or simpler: Find user habits first.
    });
    
    // Better Approach for habits:
    // We already have habit controller but for dashboard we want a summary.
    // Let's rely on HabitLog with an aggregation lookup if possible, or 2 queries.
    // First, find all habit IDs for this user.
    // (Note: To keep it optimized we might want to store userId on HabitLog, but schema is set.
    //  Let's do a 2-step query which is fine for dashboard load).
    
    const Habit = require('../models/Habit');
    const userHabits = await Habit.find({ userId }).select('_id');
    const userHabitIds = userHabits.map(h => h._id);
    
    const habitsLoggedToday = await HabitLog.countDocuments({
        habitId: { $in: userHabitIds },
        date: todayString
    });

    // 3. Learning Time per Week
    // Calculate start of the week (Sunday or Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    // Aggregate learning duration
    const learningStats = await LearningSession.aggregate([
        {
            $lookup: {
                from: 'learningtopics',
                localField: 'topicId',
                foreignField: '_id',
                as: 'topic'
            }
        },
        { $unwind: '$topic' },
        { 
            $match: { 
                'topic.userId': userId,
                date: { $gte: startOfWeek } // Filter sessions from start of week
            } 
        },
        {
            $group: {
                _id: null,
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);
    
    const totalLearningMinutes = learningStats.length > 0 ? learningStats[0].totalDuration : 0;

    res.status(200).json({
        tasks: {
            total: totalTasks,
            pending: pendingTasks,
            completed: completedTasks,
            createdToday: tasksCreatedToday
        },
        habits: {
            loggedToday: habitsLoggedToday,
            totalActive: userHabits.length
        },
        learning: {
            totalMinutesThisWeek: totalLearningMinutes
        }
    });
});

module.exports = {
    getDashboardStats,
};
