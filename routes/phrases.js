// routes/auth.js
const express = require('express');
const router = express.Router();
const phraseController = require('../controllers/phraseController');

router.post('/phrases', phraseController.getPhrases);

module.exports = router;
