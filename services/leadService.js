import { db } from "./firestoreService.js";

export async function saveLead(lead) {
  await db.collection("leads").add({
    nombre: lead.nombre,
    telefono: lead.telefono,
    interes: lead.interes,
    timestamp: Date.now()
  });
}