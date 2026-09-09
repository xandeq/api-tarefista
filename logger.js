// Configuracao do Logtail/BetterStack vem exclusivamente do ambiente.
// Nunca versionar o source token: quem tem o token consegue injetar logs na conta.
const LOGTAIL_SOURCE_TOKEN = process.env.LOGTAIL_SOURCE_TOKEN;
const LOGTAIL_ENDPOINT = process.env.LOGTAIL_ENDPOINT;

let logger;

if (LOGTAIL_SOURCE_TOKEN) {
  const { Logtail } = require("@logtail/node");
  logger = new Logtail(
    LOGTAIL_SOURCE_TOKEN,
    LOGTAIL_ENDPOINT ? { endpoint: LOGTAIL_ENDPOINT } : undefined
  );
} else {
  // Sem token configurado a aplicacao continua subindo, apenas sem envio remoto.
  console.warn(
    "[logger] LOGTAIL_SOURCE_TOKEN nao definido - usando console como fallback."
  );
  logger = {
    debug: (...args) => console.debug(...args),
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    flush: async () => {},
  };
}

module.exports = logger;
