const express = require('express');
const router = express.Router();
const {
    getTodayJournal,
    getJournals,
    createJournal,
    updateJournal,
} = require('../controllers/journalController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getJournals)
    .post(protect, createJournal);

router.get('/today', protect, getTodayJournal);
router.put('/:id', protect, updateJournal);

module.exports = router;
