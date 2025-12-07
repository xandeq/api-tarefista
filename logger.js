const { Logtail } = require("@logtail/node");
const logtail = new Logtail("C5n1RMdD8vaEpKm4DttLikQG", {
  endpoint: "https://s1480127.eu-nbg-2.betterstackdata.com",
});

logtail.error("Algo deu errado");
logtail.info("Mensagem de log com dados estruturados", { item: "Teste", value: 100 });
logtail.flush(); // opcional para garantir envio imediato

module.exports = logtail;