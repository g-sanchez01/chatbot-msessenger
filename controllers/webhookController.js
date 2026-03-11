import { saveLeadToSheets } from "../services/sheetsService.js";
import { getUserState, saveUserState } from "../services/firestoreService.js";

const processedMessages = new Set();

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log("Ejecutando handleWebhook...");

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        if (!event.message || !event.message.text) continue;

        const isEcho = event.message.is_echo;
        const psid = isEcho
          ? event.recipient.id   // cuando habla el bot, el usuario está en recipient
          : event.sender.id;     // cuando habla el usuario, está en sender

        const text = event.message.text.trim();
        const mid = event.message.mid;
        const timestamp = event.timestamp || Date.now();
        const aiMessageRead = event.message.is_echo
        const aiMessageParse = text.toLowerCase();

        if (!psid || !mid) continue;

         // Evitar mensajes duplicados
        if (processedMessages.has(mid)) {
          continue;
        }
        processedMessages.add(mid);

        /*console.log("PSID: ", psid, " escribio: ", text)
        console.log("sender:", event.sender.id);
        console.log("recipient:", event.recipient.id);
        console.log("is_echo:", event.message.is_echo);*/

        // Obtener estado desde Firestore
        let state = await getUserState(psid);

        if (!state) {
          state = { waitingForName: false, nombre: null, lastTimestamp: 0 };
        }

        // Ignorar mensajes antiguos
        if (timestamp <= state.lastTimestamp) continue;
        state.lastTimestamp = timestamp;

        // --- Mensaje de IA ---
        if (aiMessageRead) {
          if (aiMessageParse.includes("nombre")) {
            console.log(`IA preguntó por el nombre. PSID: ${psid}`);
            
            // Marcar en memoria y Firestore que estamos esperando el nombre
            state.waitingForName = true;
            await saveUserState(psid, state);

            console.log("Estado actualizado en Firestore:", state);
          }
          continue; // No procesar como respuesta de usuario
        }


        console.log("Esperando mensaje del usuario PSID ", psid, "nombre: ", text, ", estado: ", state.waitingForName)

        // --- Respuesta del Usuario ---
        if (state.waitingForName && psid !== 111177551895213) {
          const userName = text;

          console.log("Usuario escribió su nombre:", userName, "PSID: ", psid);

          // Guardar el nombre en Firestore y Sheets
          state.nombre = userName;
          state.waitingForName = false;

          await saveUserState(psid, state);
          await saveUserName({psid: psid, nombre: userName});
          console.log("Nombre guardado para PSID", psid, ":", userName);
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