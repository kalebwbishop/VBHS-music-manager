const express = require('express');
const router = express.Router();
const { getEmailLists, updateEmailLists } = require('../controllers/extraEmailsController');

// GET /api/extra-emails - Get all email lists
router.get('/', getEmailLists);

// PUT /api/extra-emails - Update email lists
router.put('/', updateEmailLists);

module.exports = router;
