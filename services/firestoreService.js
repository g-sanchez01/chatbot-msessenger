import { db } from "../db/firestore.js"; // Tu archivo donde inicializas admin y exportas db

const USERS_COLLECTION = "userStates"; // Colección donde guardamos el estado de cada usuario

/**
 * Obtener el estado de un usuario desde Firestore
 * @param {string} psid - ID del usuario (PSID)
 * @returns {Promise<Object>} - Estado del usuario
 */
export async function getUserState(psid) {
  try {
    const docRef = db.collection(USERS_COLLECTION).doc(psid);
    const doc = await docRef.get();
    if (doc.exists) {
      return doc.data();
    } else {
      // Estado inicial si no existe en Firestore
      return {
        waitingForName: false,
        nombre: null,
        lastTimestamp: 0,
      };
    }
  } catch (error) {
    console.error("Error obteniendo estado de usuario:", error);
    return {
      waitingForName: false,
      nombre: null,
      lastTimestamp: 0,
    };
  }
}

/**
 * Guardar el estado de un usuario en Firestore
 * @param {string} psid - ID del usuario (PSID)
 * @param {Object} state - Estado a guardar
 */
export async function saveUserState(psid, state) {
  try {
    const docRef = db.collection(USERS_COLLECTION).doc(psid);
    await docRef.set(state, { merge: true });
    console.log(`Estado guardado para PSID ${psid}:`, state);
  } catch (error) {
    console.error("Error guardando estado de usuario:", error);
  }
}