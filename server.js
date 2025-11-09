require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// init firebase admin and routes
const { initFirebase } = require("./server/firebaseAdmin");
initFirebase();

const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");
const { startRolling } = require("./server/rollEngine");

app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api", (req, res) => res.json({ ok: true }));

// start rolling engine (25s)
startRolling(25 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
