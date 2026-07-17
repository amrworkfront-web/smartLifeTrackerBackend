const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const validateNote = [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('content').notEmpty().withMessage('Content is required'),
];

router.route('/')
    .get(protect, getNotes)
    .post(protect, validateNote, handleValidationErrors, createNote);

router.route('/:id')
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;
