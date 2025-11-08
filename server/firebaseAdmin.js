// server/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Tạo đường dẫn tới file khóa
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, "../firebase-key.json");

// Đọc file JSON thủ công (fix cho Node trên Render)
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
