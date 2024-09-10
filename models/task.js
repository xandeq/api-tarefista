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
    this.completed = completed || false;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    this.userId = userId || null;
    this.tempUserId = tempUserId || null;
    this.completionDate = completionDate !== undefined ? completionDate : null;
    this.isRecurring = isRecurring || false;   // Definir padrão
    this.recurrencePattern = recurrencePattern || null; // Definir padrão
    this.startDate = startDate ? new Date(startDate) : null;
    this.endDate = endDate ? new Date(endDate) : null;
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
