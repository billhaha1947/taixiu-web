// ====== /server/firebaseAdmin.js ======
const admin = require("firebase-admin");

try {
  // Giải mã key base64
  const keyBase64 = process.env.FIREBASE_KEY_BASE64;
  if (!keyBase64) throw new Error("Thiếu FIREBASE_KEY_BASE64 trong .env hoặc Render!");

  const serviceAccount = JSON.parse(Buffer.from(keyBase64, "base64").toString("utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin khởi tạo thành công");
  }

  const db = admin.firestore();
  module.exports = { db };
} catch (err) {
  console.error("❌ Firebase Admin lỗi:", err);
  throw err;
}
