const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const express = require("express");
const admin = require("firebase-admin");
const AWS = require('aws-sdk');
const port = 3000;
const app = express();

const secret_name = "firebaseServiceAccountKey";

const client = new SecretsManagerClient({
  region: "us-east-1",
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
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://tarefista-default-rtdb.firebaseio.com",
    });
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
}

// Inicializar Firebase e iniciar o servidor Express
initializeFirebase().then(() => {
  const routes = require("./routes/tasks");
  app.use(express.json());
  app.use("/api", routes);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Failed to initialize Firebase:", err);
});