require("dotenv").config();
const router = require("express").Router();

router.post("/register", async (req, res) => {
  const { userName, email, password, roles } = req.body;
  const db = req.db; // Access Firestore instance from request object

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

router.post("/login", async (req, res) => {
  const { userName, email, password } = req.body;
  const db = req.db; // Access Firestore instance from request object
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
      .doc(emailQuerySnapshot.docs[0].data().userName);
  }

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    return res.json({ status: false, message: "Usuário não encontrado" });
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

module.exports = router;
