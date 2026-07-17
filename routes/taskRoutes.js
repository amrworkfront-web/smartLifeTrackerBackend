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
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const validateTask = [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Priority must be High, Medium, or Low'),
];

router.route('/')
    .get(protect, getTasks)
    .post(protect, validateTask, handleValidationErrors, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

module.exports = router;
