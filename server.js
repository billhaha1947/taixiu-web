const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const gameRoutes = require("./server/gameRoutes.js");
const adminRoutes = require("./server/adminRoutes.js");

app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy trên cổng ${PORT}`);
});
