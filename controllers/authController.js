// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

// Endpoint para registro de usuário
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    // Criar usuário no Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Armazenar detalhes adicionais do usuário no Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

module.exports = router;
