const express = require('express');
const router = express.Router();
const phraseController = require('../controllers/phraseController');

// Log de inicialização da rota
console.log("Inicializando rotas de frases...");

// Rota para pegar frases motivacionais
router.get('/phrases', (req, res, next) => {
  console.log("Rota /api/phrases foi acessada.");
  next();
}, phraseController.getPhrases);

module.exports = router;
