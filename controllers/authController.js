const admin = require("firebase-admin");
const db = admin.firestore();
const jwt = require('jsonwebtoken');

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
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autenticar usuário com o Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar a senha do usuário (você precisaria armazenar o hash da senha no Firestore e compará-lo aqui)
    // Como o Firebase Admin SDK não fornece um método para verificar a senha diretamente,
    // você pode usar Firebase Authentication no frontend para autenticar o usuário e obter um token de ID,
    // que pode ser verificado no backend.
    const token = jwt.sign({ userId: userSnapshot.docs[0].id }, 'your-secret-key', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
    // Enviar resposta de sucesso
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Implementar lógica de logout (isso pode envolver a invalidação de tokens no lado do cliente)
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Error logging out user', error: error.message });
  }
};

exports.getUserId = async (req, res) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    res.status(200).json({ userId });
  } catch (error) {
    console.error("Error getting user ID:", error);
    res.status(500).json({ message: "Error getting user ID", error: error.message });
  }
};