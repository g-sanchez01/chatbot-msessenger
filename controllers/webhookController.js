import { db } from "../db/firestore.js"
import { saveUserName } from "../services/leadService.js";

//const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log ("Ejecutando handleWebhook...")

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        // Ignorar eventos sin mensaje o sin texto
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;
        const text = event.message.text.trim();
        const aiMessageRead = event.message.is_echo
        const aiMessageParse = text.toLowerCase()

        const userRef = db.collection("users").doc(psid);
        const userDoc = await userRef.get();
        const waitingForName = userDoc.exists && userDoc.data().waitingForName;

        // Detectar cuando la IA pregunta por el nombre
        if (aiMessageRead && aiMessageParse.includes("nombre")) {
          console.log("La IA preguntó por el nombre. Esperando respuesta del usuario...");
          await userRef.set({ waitingForName: true }, { merge: true });
          continue;

        } else {
          console.log("IA aun no pregunta el nombre")
        }

        // Mensaje del usuario real
        if(!aiMessageRead && waitingForName) {
          // Extraer solo el nombre (primer palabra o usando "mi nombre es...")
          let userName = text;
          const match = text.match(/mi nombre es (\w+)/i);
          if (match) userName = match[1];
          else userName = text.split(" ")[0]; // fallback: primera palabra

          // Guardar en Firestore
          await saveUserName(psid, userName)
          await userRef.set({ waitingForName: false }, { merge: true });
          console.log("Nombre recibido y guardado para PSID", psid, ": ", userName);

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