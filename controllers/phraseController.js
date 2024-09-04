const fs = require('fs');
const path = require('path');

/**
 * Função para buscar uma frase com base no dia do mês.
 * @returns {string} - A frase correspondente ao dia do mês
 */
function fetchPhraseByDay() {
  try {
    // Caminho para o arquivo phrases.json
    const phrasesPath = path.join(__dirname, 'phrases.json');
    
    // Ler o conteúdo do arquivo JSON
    const phrasesData = fs.readFileSync(phrasesPath, 'utf-8');
    
    // Parse do JSON
    const phrases = JSON.parse(phrasesData).phrases;

    // Obter o dia atual do mês
    const today = new Date().getDate();

    // Usar o dia como índice (lembrando que o índice começa em 0)
    const phraseIndex = (today - 1) % phrases.length;

    // Retornar a frase correspondente
    return phrases[phraseIndex];
  } catch (error) {
    console.error("Erro ao buscar frase: ", error);
    throw new Error("Não foi possível buscar a frase.");
  }
}

/**
 * Controlador para lidar com requisições GET para buscar uma frase
 */
exports.getPhrases = async (req, res) => {
  try {
    const phrase = fetchPhraseByDay();
    res.status(200).json({ phrase });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar a frase." });
  }
};
