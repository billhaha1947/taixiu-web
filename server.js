const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");

app.use("/api", gameRoutes);
app.use("/api/admin", adminRoutes);

// Fallback route cho SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
