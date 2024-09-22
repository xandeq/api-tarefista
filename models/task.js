class Task {
  constructor({ 
    text, 
    completed, 
    createdAt, 
    updatedAt, 
    userId, 
    tempUserId, 
    completionDate, 
    isRecurring,    // Adicionando flag de recorrência
    recurrencePattern, // Adicionando padrão de recorrência
    startDate,     // Adicionando data de início da recorrência
    endDate        // Adicionando data de término da recorrência
  }) {
    this.text = text || "";
    this.completed = completed !== undefined ? completed : false;
    this.createdAt = createdAt !== undefined ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt !== undefined ? new Date(updatedAt) : new Date();
    this.userId = userId || null;
    this.tempUserId = tempUserId || null;
    this.completionDate = completionDate !== undefined ? completionDate : null;
    this.isRecurring = isRecurring !== undefined ? isRecurring : false;   // Definir padrão
    this.recurrencePattern = recurrencePattern !== undefined ? recurrencePattern : ''; // Definir padrão
    this.startDate = startDate !== undefined ? new Date(startDate) : null;
    this.endDate = endDate !== undefined ? new Date(endDate) : null;
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
      isRecurring: this.isRecurring,  // Incluindo recorrência
      recurrencePattern: this.recurrencePattern, // Incluindo padrão de recorrência
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }
}

module.exports = Task;
