const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');
const { Task } = require('../models/task');

exports.getTasks = async (req, res) => {
  try {
    // Extraindo os parâmetros userId e tempUserId da query string
    const { userId, tempUserId } = req.query;

    // Logando os valores recebidos para verificação
    console.log('Received userId:', userId);
    console.log('Received tempUserId:', tempUserId);

    // Verifica se pelo menos um dos parâmetros foi passado
    if (!userId && !tempUserId) {
      console.error('Neither userId nor tempUserId was provided.');
      return res.status(400).json({ message: 'User ID or Temp User ID is required' });
    }

    const tasksRef = db.collection('tasks');
    let query;

    // Construindo a query baseada nos parâmetros recebidos
    if (userId) {
      console.log('Querying tasks with userId');
      query = tasksRef.where('userId', '==', userId);
    } else if (tempUserId) {
      console.log('Querying tasks with tempUserId');
      query = tasksRef.where('tempUserId', '==', tempUserId);
    }

    // Executando a query e obtendo os resultados
    const tasksSnapshot = await query.get();

    // Se não houver documentos, loga a informação
    if (tasksSnapshot.empty) {
      console.log('No tasks found for the provided userId or tempUserId.');
    }
    // Mapeando os documentos retornados para um array de tarefas
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Retornando as tarefas encontradas
    res.status(200).json(tasks);
  } catch (error) {
    // Loga o erro para depuração
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Error getting tasks', error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    let { text, completed, createdAt, updatedAt, tempUserId, isRecurring, recurrencePattern, startDate, endDate } = req.body;

    const validCreatedAt = isValidDate(new Date(createdAt)) ? new Date(createdAt) : admin.firestore.Timestamp.now();
    const validUpdatedAt = isValidDate(new Date(updatedAt)) ? new Date(updatedAt) : admin.firestore.Timestamp.now();
    const validStartDate = isValidDate(new Date(startDate)) ? new Date(startDate) : null;
    const validEndDate = isValidDate(new Date(endDate)) ? new Date(endDate) : null;

    if (!tempUserId) {
      let tempUserIdNew = uuidv4();
      let today = new Date().toISOString().split('T')[0];
      let tasksSnapshot = await db.collection('tasks').where('tempUserId', '==', tempUserIdNew).where('createdAt', '>=', new Date(today)).get();

      if (tasksSnapshot.size >= 10) {
        return res.status(403).json({ message: 'Task limit reached for today' });
      }

      let newTask = {
        text,
        completed,
        createdAt: validCreatedAt,
        updatedAt: validUpdatedAt,
        isRecurring: isRecurring !== undefined ? isRecurring : false,
        recurrencePattern: recurrencePattern || '',
        recurrencePattern,
        startDate: validStartDate,
        endDate: validEndDate,
      };

      // Log the task being created
      console.log('Creating new task:', newTask);

      let taskRef = await db.collection('tasks').add(newTask);
      return res.status(201).json({ id: taskRef.id, tempUserId: tempUserIdNew, ...newTask });
    } else {
      let newTask = {
        text,
        completed,
        createdAt: validCreatedAt,
        updatedAt: validUpdatedAt,
        tempUserId,
        isRecurring: isRecurring !== undefined ? isRecurring : false,
        recurrencePattern: recurrencePattern != undefined ? recurrencePattern : '',
        startDate: validStartDate,
        endDate: validEndDate,
      };

      // Log the task being created
      console.log('Creating new task with tempUserId:', newTask);

      let taskRef = await db.collection('tasks').add(newTask);
      return res.status(201).json({ id: taskRef.id, ...newTask });
    }
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Error adding task', error: error.message });
  }
};

function convertFirestoreTimestampToDate(timestamp) {
  if (timestamp && timestamp._seconds && timestamp._nanoseconds) {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  }
  return null;
}
function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, createdAt, updatedAt, isRecurring, recurrencePattern, startDate, endDate, userId } = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskDoc.data().userId && taskDoc.data().userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedTask = {
      text: text !== undefined ? text : taskDoc.data().text,
      createdAt: convertFirestoreTimestampToDate(createdAt),
      updatedAt: new Date(), // always updating the timestamp
      startDate: convertFirestoreTimestampToDate(startDate),
      endDate: convertFirestoreTimestampToDate(endDate),
      completed: completed !== undefined ? completed : taskDoc.data().completed,
      isRecurring: isRecurring != undefined ? isRecurring : taskDoc.data().isRecurring,
      recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : taskDoc.data().recurrencePattern,
    };

    // Remover qualquer chave que tenha valor undefined antes de atualizar o Firestore
    Object.keys(updatedTask).forEach((key) => updatedTask[key] === undefined && delete updatedTask[key]);

    // Log the task being updated
    console.log('Updating task with ID:', id, 'with data:', updatedTask);

    await taskRef.update(updatedTask);
    res.status(200).send('Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();
    console.log('taskRef', taskRef);
    console.log('taskDoc', taskDoc);
    console.log('taskDoc.data()', taskDoc.data());
    console.log('taskDoc.data().userId', taskDoc.data().userId);
    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await taskRef.delete();
    res.status(200).send('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error); // Log the error for server-side debugging
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

exports.syncTasks = async (req, res) => {
  try {
    const { tasks, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for syncing tasks' });
    }

    const batch = db.batch();

    tasks.forEach((task) => {
      const taskRef = db.collection('tasks').doc();
      batch.set(taskRef, {
        text: task.text,
        completed: task.completed,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        userId,
      });
    });

    await batch.commit();
    res.status(200).json({ message: 'Tasks synced successfully' });
  } catch (error) {
    console.error('Error syncing tasks:', error); // Log the error for server-side debugging
    res.status(500).json({ message: 'Error syncing tasks', error: error.message });
  }
};
