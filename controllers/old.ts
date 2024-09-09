import { Request, Response } from "express";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

// Interface para Task
interface Task {
    id?: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId?: string;
    tempUserId?: string;
}

// Função para obter tarefas
export const getTasks = async (req: Request, res: Response) => {
    try {
        const { userId, tempUserId } = req.query;

        if (!userId && !tempUserId) {
            return res
                .status(400)
                .json({ message: "User ID or Temp User ID is required" });
        }

        const tasksRef = db.collection("tasks");
        let query;

        if (userId) {
            query = tasksRef.where("userId", "==", userId);
        } else if (tempUserId) {
            query = tasksRef.where("tempUserId", "==", tempUserId);
        }

        const tasksSnapshot = await query.get();
        const tasks: Task[] = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error getting tasks:", error);
        res
            .status(500)
            .json({ message: "Error getting tasks", error: error.message });
    }
};

// Função para adicionar tarefa
export const addTask = async (req: Request, res: Response) => {
    try {
        const { text, completed, createdAt, updatedAt, tempUserId }: Task = req.body;

        let tempUserIdNew = tempUserId || uuidv4();

        let newTask: Task = {
            text,
            completed,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
            tempUserId: tempUserIdNew,
        };

        let taskRef = await db.collection("tasks").add(newTask);

        res.status(201).json({ id: taskRef.id, ...newTask });
    } catch (error) {
        console.error("Error adding task:", error);
        res
            .status(500)
            .json({ message: "Error adding task", error: error.message });
    }
};

// Função para atualizar tarefa
// Função para atualizar tarefa
export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { text, completed, createdAt, updatedAt, userId }: Task = req.body;

        const taskRef = db.collection("tasks").doc(id);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists || taskDoc.data()?.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Usando a função update do Firestore com os campos específicos
        const updatedFields = {
            text,
            completed,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
        };

        await taskRef.update(updatedFields);
        res.status(200).send("Task updated successfully");
    } catch (error) {
        console.error("Error updating task:", error);
        res
            .status(500)
            .json({ message: "Error updating task", error: error.message });
    }
};


// Função para deletar tarefa
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const taskRef = db.collection("tasks").doc(id);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists || taskDoc.data()?.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await taskRef.delete();
        res.status(200).send("Task deleted successfully");
    } catch (error) {
        console.error("Error deleting task:", error);
        res
            .status(500)
            .json({ message: "Error deleting task", error: error.message });
    }
};
