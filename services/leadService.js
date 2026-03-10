import { db } from "../db/firestoreService.js";

export async function saveLead(lead) {
  await db.collection("leads").add({
    nombre: lead.nombre
  });
}