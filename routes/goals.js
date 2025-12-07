const express = require('express');
const router = express.Router();
const { addGoal, getGoals, deleteGoal } = require('../controllers/goalsController');

router.post('/goals', addGoal);
router.get('/goals', getGoals);
router.delete('/goals/:goalId', deleteGoal);

module.exports = router;
