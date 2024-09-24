const express = require('express');
const router = express.Router();
const { addGoal, getGoals } = require('../controllers/goalsController');

// Rota para adicionar metas
router.post('/goals', addGoal);

// Rota para obter metas
router.get('/goals', getGoals);

module.exports = router;
