class Task {
  constructor({ text, completed, createdAt, updatedAt, userId, tempUserId, completionDate }) {
    this.text = text || "";
    this.completed = completed || false;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    this.userId = userId || null;
    this.tempUserId = tempUserId || null;
    this.completionDate = completionDate !== undefined ? completionDate : null
  }

  toFirestore() {
    return {
      text: this.text,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completionDate: this.completionDate,
      userId: this.userId,
      tempUserId: this.tempUserId,
    };
  }
}

module.exports = Task;