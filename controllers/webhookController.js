import { db } from "../db/firestore.js"
import { saveUserName } from "../services/leadService.js";

//const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log("Ejecutando handleWebhook...");

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;
        const text = event.message.text.trim();
        const isAIMessage = !!event.message.is_echo;

        const userRef = db.collection("users").doc(psid);
        const userDoc = await userRef.get();
        const waitingForName = userDoc.exists ? userDoc.data().waitingForName : false;

        // --- Detectar cuando la IA pregunta por el nombre ---
        if (isAIMessage && text.toLowerCase().includes("nombre")) {
          console.log("La IA preguntó por el nombre. Marcando usuario como esperando nombre...");
          // Guardar en Firestore que el usuario debe enviar su nombre
          await userRef.set({ waitingForName: true }, { merge: true });
          continue; // ya no procesamos más este mensaje
        }

        // --- Mensaje del usuario real ---
        if (!isAIMessage && waitingForName) {
          // Extraer solo el nombre
          let userName = text;
          const match = text.match(/mi nombre es (\w+)/i);
          if (match) userName = match[1];
          else userName = text.split(" ")[0]; // fallback

          // Guardar nombre en Firestore y quitar waitingForName
          console.log(`Guardando nombre para PSID ${psid}: ${userName}`);
          await saveUserName(psid, userName);
          await userRef.set({ waitingForName: false }, { merge: true });
        }
      }
    }
  } catch (error) {
    console.error("Error en webhook:", error);
  }
} 

// Verificación de webhook
export function verifyWebhook(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}