import { db } from "../db/firestoreService.js";

export async function saveMessage(psid, text, role) {
  await db.collection("messages").add({
    psid,
    text,
    role,
    timestamp: Date.now()
  });
}