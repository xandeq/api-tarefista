class TaskModel {
    constructor({ text, completed = false, createdAt = new Date(), updatedAt = new Date(), completionDate = null, userId = null, tempUserId = null }) {
      this.text = text; // Título ou descrição da tarefa
      this.completed = completed; // Status de conclusão (boolean)
      this.createdAt = new Date(createdAt); // Data de criação (Date)
      this.updatedAt = new Date(updatedAt); // Data de última atualização (Date)
      this.completionDate = completionDate ? new Date(completionDate) : null; // Data de conclusão opcional (Date ou null)
      this.userId = userId; // ID do usuário registrado (string ou null)
      this.tempUserId = tempUserId; // ID temporário do usuário não registrado (string ou null)
    }
  
    // Método para converter para um objeto plano, pronto para salvar no Firestore
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
  module.exports = TaskModel;