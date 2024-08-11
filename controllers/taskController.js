const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

exports.getTasks = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const tasksSnapshot = await db
      .collection("tasks")
      .where("userId", "==", userId)
      .get();

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error); // Log the error for server-side debugging
    res
      .status(500)
      .json({ message: "Error getting tasks", error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    const { text, completed, createdAt, updatedAt, userId } = req.body;
    if (!userId) {
      // Generate a unique ID for unregistered users if you plan to track them
      const tempUserId = uuidv4();

      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const tasksSnapshot = await db
        .collection("tasks")
        .where("tempUserId", "==", tempUserId)
        .where("createdAt", ">=", new Date(today))
        .get();

      if (tasksSnapshot.size >= 10) {
        return res
          .status(403)
          .json({ message: "Task limit reached for today" });
      }

      const newTask = {
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        tempUserId, // Save the temp ID for unregistered users
      };

      const taskRef = await db.collection("tasks").add(newTask);
      return res.status(201).json({ id: taskRef.id, ...newTask });
    } else {
      // Regular flow for registered users
      const newTask = {
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        userId, // Associate task with registered user
      };

      const taskRef = await db.collection("tasks").add(newTask);
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
