import admin from "firebase-admin";

// Leer la clave desde la variable de entorno
const serviceAccountJSON = process.env.SERVICE_ACCOUNT_KEY_JSON;

if (!serviceAccountJSON) {
  throw new Error("No se encontró la variable de entorno SERVICE_ACCOUNT_KEY_JSON");
}

// Parsear el JSON
const serviceAccount = JSON.parse(serviceAccountJSON);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exportar la base de datos
export const db = admin.firestore();