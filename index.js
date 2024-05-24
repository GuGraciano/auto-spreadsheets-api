require("dotenv").config();

const express = require("express");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const app = express();
const PORT = process.env.PORT || 5000;

const serviceAccount = require("./auto-spreadsheets-9d3d0-firebase-adminsdk-4qvon-7a1893000f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

app.use(express.json());

app.get("/", async (req, res) => {
  res.json({ message: "Ok" });
});

app.post("/register", async (req, res) => {
  const { userName, email, password, roles } = req.body;

  const userRef = db.collection("users").doc(userName);

  const userSnapshot = await userRef.get();

  if (userSnapshot.exists) {
    return res.json({
      status: false,
      message: `Usuário ${userName} já está sendo usado`,
    });
  }

  const emailQuerySnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .get();
  if (!emailQuerySnapshot.empty) {
    return res.json({
      status: false,
      message: `O email ${email} já está sendo usado`,
    });
  }

  const newUser = {
    userName,
    email,
    password,
    roles,
  };

  await userRef.set(newUser);

  return res.json({ status: true, newUser });
});

app.post("/login", async (req, res) => {
  const { userName, email, password } = req.body;
  let userRef = db.collection("users");

  if (userName) {
    userRef = userRef.doc(userName);
  } else {
    const emailQuerySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (emailQuerySnapshot.empty) {
      return res.json({
        status: false,
        message: `O email ${email} não foi encontrado em nenhum usuário`,
      });
    }

    userRef = db
      .collection("users")
      .doc(emailQuerySnapshot.docs.at(0).data().userName);
  }

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    res.json({ status: false, message: "Usuário não encontrado" });
  }

  const userData = userSnapshot.data();

  if (password !== userData.password) {
    return res.json({
      status: false,
      message: "Senha incorreta",
    });
  }

  res.json({ status: true, userData });
});

app.listen(PORT, () => {
  console.log(`Rodando na porta --> ${PORT}`);
});
