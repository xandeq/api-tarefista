const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");
const Task = require("../models/task");

exports.getTasks = async (req, res) => {
  try {
    const { userId, tempUserId } = req.query;
    if (!userId && !tempUserId) {
      return res
        .status(400)
        .json({ message: "User ID or Temp User ID is required" });
    }

    const tasksRef = db.collection("tasks");
    const query = userId
      ? tasksRef.where("userId", "==", userId)
      : tasksRef.where("tempUserId", "==", tempUserId);

    const tasksSnapshot = await query.get();
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting tasks", error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    let { text, completed, createdAt, updatedAt, tempUserId } = req.body;
    text = text || "";
    completed = completed || false;
    createdAt = createdAt ? new Date(createdAt) : new Date();
    updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    completionDate = completionDate ?? "";
    const newTask = new Task({
      text,
      completed,
      createdAt,
      updatedAt,
      completionDate,
      tempUserId: tempUserId || uuidv4(), // Generate tempUserId if not provided
    });
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

      let newTask = new Task({
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        completionDate
      });

      const taskData = newTask.toFirestore();
      let taskRef = await db.collection("tasks").add(taskData);
      return res
        .status(201)
        .json({ id: taskRef.id, tempUserId: tempUserIdNew, ...newTask });
    } else {
      // Regular flow for registered users
      let newTask = new Task({
        text,
        completed,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        tempUserId, // Associate task with registered user
      });

      const taskData = newTask.toFirestore();
      const taskRef = await db.collection("tasks").add(taskData);
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
    let {
      text,
      completed,
      createdAt,
      updatedAt,
      userId,
      completionDate,
      tempUserId,
    } = req.body;
    text = text || "";
    completed = completed || false;
    createdAt = createdAt ? new Date(createdAt) : new Date();
    updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    completionDate = completionDate ?? "";
    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to Update Task" });
    }

    const updatedTask = new Task({
      ...taskDoc.data(),
      text,
      completed,
      updatedAt: new Date(updatedAt),
    });

    await taskRef.update(updatedTask.toFirestore());
    res.status(200).send("Task updated successfully");
  } catch (error) {
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
      return res.status(403).json({ message: "Unauthorized to Delete Task" });
    }

    await taskRef.delete();
    res.status(200).send("Task deleted successfully");
  } catch (error) {
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
      const newTask = new Task({ ...task, userId });
      const taskRef = db.collection("tasks").doc();
      batch.set(taskRef, newTask);
    });

    await batch.commit();
    res.status(200).json({ message: "Tasks synced successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error syncing tasks", error: error.message });
  }
};
