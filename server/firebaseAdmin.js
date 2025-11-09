// /server/firebaseAdmin.js
const admin = require("firebase-admin");

try {
  const keyBase64 = process.env.FIREBASE_KEY_BASE64;
  if (!keyBase64) throw new Error("Missing FIREBASE_KEY_BASE64 env");

  const serviceAccount = JSON.parse(Buffer.from(keyBase64, "base64").toString("utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  }

  const db = admin.firestore();
  module.exports = { admin, db };
} catch (err) {
  console.error("❌ firebaseAdmin init error:", err);
  throw err;
}
