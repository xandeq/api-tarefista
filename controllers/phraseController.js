const fs = require('fs');
const path = require('path');

/**
 * Função para buscar uma frase com base no dia do mês.
 * @returns {string} - A frase correspondente ao dia do mês
 */
function fetchPhraseByDay() {
  try {
    console.log("Iniciando leitura de frases...");

    // Caminho para o arquivo phrases.json
    const phrasesPath = path.join(__dirname, 'phrases.json');
    console.log("Caminho para o arquivo phrases.json:", phrasesPath);
    
    // Ler o conteúdo do arquivo JSON
    const phrasesData = fs.readFileSync(phrasesPath, 'utf-8');
    console.log("Conteúdo do arquivo phrases.json lido com sucesso.");

    // Parse do JSON
    const phrases = JSON.parse(phrasesData).phrases;
    console.log("Frases parseadas:", phrases);

    // Obter o dia atual do mês
    const today = new Date().getDate();
    console.log("Dia do mês atual:", today);

    // Usar o dia como índice (lembrando que o índice começa em 0)
    const phraseIndex = (today - 1) % phrases.length;
    console.log("Índice da frase a ser retornada:", phraseIndex);

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
  console.log("Rota /phrases chamada.");
  try {
    const phrase = fetchPhraseByDay();
    console.log("Frase retornada:", phrase);
    res.status(200).json({ phrase });
  } catch (error) {
    console.error("Erro no controlador getPhrases:", error);
    res.status(500).json({ error: "Erro ao buscar a frase." });
  }
};
