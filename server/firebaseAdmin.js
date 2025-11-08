// server/firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "../firebase-key.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };
