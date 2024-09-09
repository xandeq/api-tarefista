class Task {
  constructor({ text, completed, createdAt, updatedAt, userId, tempUserId }) {
    this.text = text || "";
    this.completed = completed || false;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    this.userId = userId || null;
    this.tempUserId = tempUserId || null;
  }
}

module.exports = Task;