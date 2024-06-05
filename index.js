require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const PORT = process.env.PORT || 5000;

const api = require("./routes/api");

const serviceAccount = require("./auto-spreadsheets-9d3d0-firebase-adminsdk-4qvon-7a1893000f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore(); // Initialize Firestore here

app.use(cors());

app.use(express.json()); // Middleware to parse JSON request bodies

app.use(
  "/api",
  (req, res, next) => {
    req.db = db; // Attach Firestore instance to request object
    next();
  },
  api
);

app.use("/", async (req, res) => {
  res.json({ message: "Ok" });
});

server.listen(PORT, () => {
  console.log(`Rodando na porta --> ${PORT}`);
});
