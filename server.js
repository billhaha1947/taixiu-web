import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import gameRoutes from "./server/gameRoutes.js";
import adminRoutes from "./server/adminRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// Serve frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render cần PORT động
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại cổng ${PORT}`));
