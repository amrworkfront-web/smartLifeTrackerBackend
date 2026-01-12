const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');

// @desc    Get all tasks for the logged in user
// @route   GET /tasks
// @access  Private
// const getTasks = asyncHandler(async (req, res) => {
//     const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json(tasks);
// });
// @desc    Get all tasks (with filters)
// @route   GET /tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { priority, type } = req.query;

    // base filter (important)
    let filter = {
        userId: req.user.id
    };

    // -------- Priority Filter --------
    if (priority && priority !== 'all') {
        filter.priority = priority;
    }

    // -------- Date Filters --------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        filter.deadline = {
            $gte: today,
            $lt: tomorrow
        };
    }

    if (type === 'upcoming') {
        filter.deadline = {
            $gt: today
        };
    }

    const tasks = await Task.find(filter)
        .sort({ deadline: 1, createdAt: -1 });

    res.status(200).json(tasks);
});


// @desc    Create a new task
// @route   POST /tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority, status, dueDate,deadline } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please add a text field');
    }

    const task = await Task.create({
        userId: req.user.id,
        title,
        description,
        priority,
        deadline,
        status,
        dueDate
    });

    res.status(201).json(task);
});

// @desc    Update task
// @route   PUT /tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the task user
    if (task.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the task user
    if (task.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
