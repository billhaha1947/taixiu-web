// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// import routes
import adminRoutes from "./server/adminRoutes.js";
import gameRoutes from "./server/gameRoutes.js";
import { startAutoRoll } from "./server/rollEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// setup middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// routes
app.use("/api/admin", adminRoutes);
app.use("/api/game", gameRoutes);

// serve main page
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startAutoRoll(); // auto roll mỗi 25s
});
