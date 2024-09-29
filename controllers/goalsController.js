const admin = require('firebase-admin');
const db = admin.firestore();

// Função para adicionar metas no Firebase
exports.addGoal = async (req, res) => {
  try {
    const { text, periodicity, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const newGoal = {
      text,
      periodicity,
      userId, // Inclui o userId na meta
      createdAt: new Date(),
    };

    const goalRef = await db.collection('goals').add(newGoal);
    console.log('Goal added with ID:', goalRef.id);
    console.log('Goal Ref:', goalRef);
    res.status(201).json({ id: goalRef.id, ...newGoal });
  } catch (error) {
    console.error('Erro ao registrar o usuário:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || 'UNKNOWN_ERROR',
      additionalInfo: error.additionalInfo || 'No additional information available',
    });

    // Responder com uma mensagem de erro detalhada para o app
    res.status(500).json({
      message: 'Error registering user',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // Pode omitir isso em produção
        code: error.code || 'UNKNOWN_ERROR',
        additionalInfo: error.additionalInfo || 'No additional information available',
      },
    });
  }
};

// Função para deletar metas do Firebase
exports.deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    console.log('Goal ID:', goalId); // Log para verificar o goalId

    if (!goalId) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    const goalRef = db.collection('goals').doc(goalId);

    const doc = await goalRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goalRef.delete();
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar a meta:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || 'UNKNOWN_ERROR',
      additionalInfo: error.additionalInfo || 'No additional information available',
    });

    // Responder com uma mensagem de erro detalhada para o app
    res.status(500).json({
      message: 'Error deleting goal',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // Pode omitir isso em produção
        code: error.code || 'UNKNOWN_ERROR',
        additionalInfo: error.additionalInfo || 'No additional information available',
      },
    });
  }
};

// Função para obter metas do Firebase
exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const goalsSnapshot = await db.collection('goals').where('userId', '==', userId).get();

    const goals = goalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(goals);
  } catch (error) {
    console.error('Erro ao registrar o usuário:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || 'UNKNOWN_ERROR',
      additionalInfo: error.additionalInfo || 'No additional information available',
    });

    // Responder com uma mensagem de erro detalhada para o app
    res.status(500).json({
      message: 'Error registering user',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // Pode omitir isso em produção
        code: error.code || 'UNKNOWN_ERROR',
        additionalInfo: error.additionalInfo || 'No additional information available',
      },
    });
  }
};
