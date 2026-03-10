import { db } from "./firestoreService.js";

export async function saveUserName(psid, name) {
  try {
    // Guardar el nombre con el ID del usuario como documento
    await db.collection("users").doc(psid).set({
      nombre: name,
      updatedAt: new Date()
    });
    console.log(`Nombre guardado para PSID ${psid}: ${name}`);
  } catch (error) {
    console.error("Error guardando nombre en Firestore:", error);
  }
}