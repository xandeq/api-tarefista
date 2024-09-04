const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Função para buscar frases de um autor no site O Pensador
 * @param {string} author - O nome do autor
 * @returns {JSON} - Frases do autor
 */
async function fetchPhrases(author) {
  try {
    const formattedAuthor = author.replace(" ", "_").toLowerCase();
    let url = `https://pensador.uol.com.br/${formattedAuthor}/`;
    let phrases = {};
    let count = 0;

    // Função para extrair frases de uma página
    const extractPhrases = async (url) => {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Selecionar os elementos que contêm as frases
      $(".frase").each((index, element) => {
        let phraseText = $(element).text().trim();
        if (phraseText) {
          phrases[count] = phraseText;
          count++;
        }
      });

      // Verificar se há um link para a próxima página de frases
      const nextPageLink = $(".next a").attr('href');
      return nextPageLink ? `https://pensador.uol.com.br${nextPageLink}` : null;
    };

    // Loop para percorrer múltiplas páginas (caso existam)
    while (url) {
      url = await extractPhrases(url);
    }

    return phrases;

  } catch (error) {
    console.error("Erro ao buscar frases: ", error);
    throw new Error("Não foi possível buscar as frases.");
  }
}

/**
 * Controlador para lidar com requisições GET para buscar frases de um autor
 */
exports.getPhrases = async (req, res) => {
  const author = req.query.author;

  if (!author) {
    return res.status(400).json({ error: "O nome do autor é obrigatório." });
  }

  try {
    const phrases = await fetchPhrases(author);
    if (Object.keys(phrases).length === 0) {
      return res.status(404).json({ message: "Nenhuma frase encontrada para o autor fornecido." });
    }
    res.status(200).json(phrases);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar frases do autor." });
  }
};
