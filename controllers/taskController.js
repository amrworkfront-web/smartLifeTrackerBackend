const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');

const getTasks = asyncHandler(async (req, res) => {
    const { priority, type, search, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.user.id };

    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    if (priority && priority !== 'all') {
        filter.priority = priority;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    if (!type) {
        filter.$or = [
            { deadline: { $exists: false } },
            { deadline: { $gte: today, $lt: tomorrow } },
            { deadline: { $gt: endOfToday } },
        ];
    } else if (type === 'today') {
        filter.$or = [
            { deadline: { $exists: false } },
            { deadline: { $gte: today, $lt: tomorrow } },
        ];
    } else if (type === 'upcoming') {
        filter.deadline = { $gt: endOfToday };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .sort({ deadline: 1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Task.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: tasks,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority, status, dueDate, deadline } = req.body;

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
        dueDate,
    });

    res.status(201).json({ success: true, data: task });
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    const { title, description, priority, status, deadline, dueDate } = req.body;

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (priority !== undefined) updatedFields.priority = priority;
    if (status !== undefined) updatedFields.status = status;
    if (deadline !== undefined) updatedFields.deadline = deadline;
    if (dueDate !== undefined) updatedFields.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: { id: req.params.id } });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
