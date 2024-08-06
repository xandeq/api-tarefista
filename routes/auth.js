// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Supondo que você tenha um modelo User

// Endpoint para registro de usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar novo usuário
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

module.exports = router;
