const admin = require("firebase-admin");
const db = admin.firestore();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.registerUser = async (req, res) => {
  const { email, password, displayName } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    // Criar usuário no Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Armazenar detalhes adicionais do usuário no Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error logging in user:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || null, // Optional: include the error code if it exists
      additionalInfo: error.additionalInfo || null, // Optional: include any other relevant info
    });

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error logging in user",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // You might want to omit this in production for security reasons
        code: error.code || "UNKNOWN_ERROR",
        additionalInfo:
          error.additionalInfo || "No additional information available",
      },
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user data from Firestore by email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnapshot.docs[0].data();

    // Log para depuração
    console.log("Password provided by user:", password);
    console.log("Stored hashed password:", userData.password);

    // Verifique se ambos os valores estão definidos antes de prosseguir
    if (!password || !userData.password) {
      throw new Error("Missing data or hash for bcrypt comparison");
    }

    // Compare the provided password with the hashed password stored in Firestore
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const secretKey = "seu-segredo-jwt-aqui";
    const token = jwt.sign({ userId: userSnapshot.docs[0].id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || "UNKNOWN_ERROR",
      additionalInfo:
        error.additionalInfo || "No additional information available",
    });

    res.status(500).json({
      message: "Error logging in user",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // Cuidado ao expor isso em produção
        code: error.code || "UNKNOWN_ERROR",
        additionalInfo:
          error.additionalInfo || "No additional information available",
      },
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Implementar lógica de logout (isso pode envolver a invalidação de tokens no lado do cliente)
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging in user:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || null, // Optional: include the error code if it exists
      additionalInfo: error.additionalInfo || null, // Optional: include any other relevant info
    });

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error logging in user",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // You might want to omit this in production for security reasons
        code: error.code || "UNKNOWN_ERROR",
        additionalInfo:
          error.additionalInfo || "No additional information available",
      },
    });
  }
};

exports.getUserId = async (req, res) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.userId;

    res.status(200).json({ userId });
  } catch (error) {
    console.error("Error logging in user:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code || null, // Optional: include the error code if it exists
      additionalInfo: error.additionalInfo || null, // Optional: include any other relevant info
    });

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error logging in user",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack, // You might want to omit this in production for security reasons
        code: error.code || "UNKNOWN_ERROR",
        additionalInfo:
          error.additionalInfo || "No additional information available",
      },
    });
  }
};
