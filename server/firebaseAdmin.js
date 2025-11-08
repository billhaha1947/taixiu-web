const admin = require("firebase-admin");

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  }

  const db = admin.firestore();
  module.exports = { db };

} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  throw new Error("Firebase initialization error");
}
