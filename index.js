const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const express = require("express");
const admin = require("firebase-admin");
const AWS = require('aws-sdk');
const port = process.env.PORT || 3000;
const app = express();
const cors = require('cors');
const config = require('./config');
const logger = require("./logger");
const morgan = require("morgan");

const secret_name = "firebaseServiceAccountKey";

const client = new SecretsManagerClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
});


async function getSecret() {
  let response;
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    console.error("Error getting secret: ", error);
    throw error;
  }

  console.log("Secret retrieved: ", response.SecretString);
  const secretObject = JSON.parse(response.SecretString);
  return JSON.parse(secretObject.firebaseServiceAccountKey);
}

async function initializeFirebase() {
  try {
    const serviceAccount = await getSecret();
    admin.initializeApp({
      ignoreUndefinedProperties: true,
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://tarefista-default-rtdb.firebaseio.com",
    });
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
}

app.use(cors({
  origin: '*', // ou '*', para permitir de qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use((err, req, res, next) => {
  logger.error("Erro capturado", {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });
  res.status(500).send("Internal Server Error");
});


// app.get("/logs", (req, res) => {
//   const logFile = path.join(__dirname, "requests.log");
//   fs.readFile(logFile, "utf8", (err, data) => {
//     if (err) {
//       console.error("Erro ao ler o arquivo de log:", err);
//       return res.status(500).send("Erro ao ler o arquivo de log.");
//     }
//     res.type("text").send(data);
//   });
// });

// 🔹 Swagger Config
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tarefista API",
      version: "1.0.0",
      description: "Documentação da API Tarefista",
    },
    servers: [{ url: "http://localhost:3000/api" }], // ajuste conforme ambiente
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // varre seus arquivos de rotas/controllers
};

const swaggerSpec = swaggerJsdoc(options);

// 🔹 Rota do Swagger (antes das rotas da API)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Inicializar Firebase e iniciar o servidor Express
initializeFirebase().then(() => {
  const taskRoutes = require("./routes/tasks");
  const authRoutes = require('./routes/auth');
  const phraseRoutes = require("./routes/phrases");
  const goalRoutes = require('./routes/goals');
  app.use(express.json());
  app.use("/api", taskRoutes);  
  app.use('/api', authRoutes);
  app.use("/api", phraseRoutes);
  app.use("/api", goalRoutes);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Failed to initialize Firebase:", err);
});