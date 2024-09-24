const admin = require('firebase-admin');

// Função para adicionar metas no Firebase
exports.addGoal = async (req, res) => {
  try {
    const { text, periodicity } = req.body;

    if (!text || !periodicity) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const goalData = {
      text,
      periodicity,
      createdAt: new Date(),
    };

    // Salvando a meta no Firebase
    const newGoalRef = await admin.firestore().collection('goals').add(goalData);

    res.status(200).json({
      message: "Meta adicionada com sucesso",
      id: newGoalRef.id,
    });
  } catch (error) {
    console.error("Erro ao adicionar meta:", error);
    res.status(500).json({ message: "Erro ao adicionar meta" });
  }
};

// Função para obter metas do Firebase
exports.getGoals = async (req, res) => {
  try {
    const goalsRef = admin.firestore().collection('goals');
    const snapshot = await goalsRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "Nenhuma meta encontrada." });
    }

    const goals = [];
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    res.status(500).json({ message: "Erro ao buscar metas" });
  }
};
