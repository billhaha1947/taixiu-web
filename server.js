// server.js (root)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// init firebase admin (this file loads server/firebaseAdmin.js)
require("./server/firebaseAdmin");

const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");
const { startRolling } = require("./server/rollEngine");

const app = express();
app.use(cors());
app.use(express.json());

// serve static
app.use(express.static(path.join(__dirname, "public")));

// api
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// simple ping
app.get("/api", (req, res) => res.json({ ok: true }));

// start rolling engine
startRolling();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
