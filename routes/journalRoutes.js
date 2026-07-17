const express = require('express');
const router = express.Router();
const {
    getJournals,
    createJournal,
    updateJournal,
    deleteJournal,
} = require('../controllers/journalController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const validateJournal = [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('mood')
        .isIn(['Happy', 'Neutral', 'Sad'])
        .withMessage('Mood must be Happy, Neutral, or Sad'),
    body('content').notEmpty().withMessage('Content is required'),
];

router.route('/')
    .get(protect, getJournals)
    .post(protect, validateJournal, handleValidationErrors, createJournal);

router.route('/:id')
    .put(protect, updateJournal)
    .delete(protect, deleteJournal);

module.exports = router;
