const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Validation
const validateTask = [
    body('title').notEmpty().withMessage('Title is required')
];

const handleValidationErrors = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.route('/')
    .get(protect, getTasks)
    .post(protect, validateTask, handleValidationErrors, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

module.exports = router;
