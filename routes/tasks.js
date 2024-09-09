const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController.ts');

router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.addTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/sync', taskController.syncTasks);

module.exports = router;