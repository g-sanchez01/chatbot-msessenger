import { db } from "../db/firestore.js";

const USERS_COLLECTION = "userStates";

/**
 * Obtener el estado de un usuario desde Firestore
 * @param {string} psid
 * @returns {Promise<Object>}
 */
export async function getUserState(psid) {
  try {

    const docRef = db.collection(USERS_COLLECTION).doc(psid);
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data();
    }

    // Estado inicial si el usuario aún no existe
    return {
      waitingForName: false,
      waitingForPhone: false,
      waitingForLocation: false,

      nombre: null,
      telefono: null,
      localidad: null,

      lastTimestamp: 0
    };

  } catch (error) {

    console.error("Error obteniendo estado de usuario:", error);

    return {
      waitingForName: false,
      waitingForPhone: false,
      waitingForLocation: false,

      nombre: null,
      telefono: null,
      localidad: null,

      lastTimestamp: 0
    };

  }
}

/**
 * Guardar el estado de un usuario en Firestore
 * @param {string} psid
 * @param {Object} state
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