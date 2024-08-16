const admin = require("firebase-admin");
const db = admin.firestore();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  const { email, password, displayName } = req.body;

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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
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

    // Compare the provided password with the hashed password stored in Firestore
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const secretKey =
      "803e35bff385378023866622ae38dcd03468f06ed76fbd791e180b6634370efc";
    const token = jwt.sign({ userId: userSnapshot.docs[0].id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Implementar lógica de logout (isso pode envolver a invalidação de tokens no lado do cliente)
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res
      .status(500)
      .json({ message: "Error logging out user", error: error.message });
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
    console.error("Error getting user ID:", error);
    res
      .status(500)
      .json({ message: "Error getting user ID", error: error.message });
  }
};
