const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

exports.getTasks = async (req, res) => {
  try {
    // Extraindo os parâmetros userId e tempUserId da query string
    const { userId, tempUserId } = req.query;

    // Logando os valores recebidos para verificação
    console.log("Received userId:", userId);
    console.log("Received tempUserId:", tempUserId);

    // Verifica se pelo menos um dos parâmetros foi passado
    if (!userId && !tempUserId) {
      console.error("Neither userId nor tempUserId was provided.");
      return res
        .status(400)
        .json({ message: "User ID or Temp User ID is required" });
    }

    const tasksRef = db.collection("tasks");
    let query;

    // Construindo a query baseada nos parâmetros recebidos
    if (userId) {
      console.log("Querying tasks with userId");
      query = tasksRef.where("userId", "==", userId);
    } else if (tempUserId) {
      console.log("Querying tasks with tempUserId");
      query = tasksRef.where("tempUserId", "==", tempUserId);
    }

    // Executando a query e obtendo os resultados
    const tasksSnapshot = await query.get();

    // Se não houver documentos, loga a informação
    if (tasksSnapshot.empty) {
      console.log("No tasks found for the provided userId or tempUserId.");
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
    console.error("Error getting tasks:", error);
    res
      .status(500)
      .json({ message: "Error getting tasks", error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    let { text, completed, createdAt, updatedAt, tempUserId } = req.body;

    if (!tempUserId) {
      // Generate a unique ID for unregistered users if you plan to track them
      let tempUserIdNew = uuidv4();

      let today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      let tasksSnapshot = await db
        .collection("tasks")
        .where("tempUserId", "==", tempUserIdNew)
        .where("createdAt", ">=", new Date(today))
        .get();

      if (tasksSnapshot.size >= 10) {
        return res
          .status(403)
          .json({ message: "Task limit reached for today" });
      }

      let newTask = {
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      };

      let taskRef = await db.collection("tasks").add(newTask);
      return res.status(201).json({ id: taskRef.id, tempUserId: tempUserIdNew, ...newTask });
    } else {
      // Regular flow for registered users
      let newTask = {
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        tempUserId, // Associate task with registered user
      };

      let taskRef = await db.collection("tasks").add(newTask);
      return res.status(201).json({ id: taskRef.id, ...newTask });
    }
  } catch (error) {
    console.error("Error adding task:", error); // Log the error for server-side debugging
    res
      .status(500)
      .json({ message: "Error adding task", error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, createdAt, updatedAt, userId } = req.body;

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedTask = {
      text,
      completed,
      createdAt,
      updatedAt: new Date(updatedAt),
    };

    await taskRef.update(updatedTask);
    res.status(200).send("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error); // Log the error for server-side debugging
    res
      .status(500)
      .json({ message: "Error updating task", error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await taskRef.delete();
    res.status(200).send("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error); // Log the error for server-side debugging
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.message });
  }
};

exports.syncTasks = async (req, res) => {
  try {
    const { tasks, userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required for syncing tasks" });
    }

    const batch = db.batch();

    tasks.forEach((task) => {
      const taskRef = db.collection("tasks").doc();
      batch.set(taskRef, {
        text: task.text,
        completed: task.completed,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        userId,
      });
    });

    await batch.commit();
    res.status(200).json({ message: "Tasks synced successfully" });
  } catch (error) {
    console.error("Error syncing tasks:", error); // Log the error for server-side debugging
    res
      .status(500)
      .json({ message: "Error syncing tasks", error: error.message });
  }
};
