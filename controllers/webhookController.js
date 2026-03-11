import { saveUserName } from "../services/leadService.js";

const userLeads = {}; // estado por PSID
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

        const psid = event.sender.id;
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

        console.log("PSID: ", psid, " escribio: ", text)

        // Obtener estado del usuario desde Firestore
        let state = await getUserState(psid);
        if (!state) {
          state = {
            waitingForName: false,
            nombre: null,
            lastTimestamp: 0,
          };
        }

        // Ignorar eventos antiguos
        if (timestamp <= state.lastTimestamp) {
          console.log("Evento antiguo ignorado:", timestamp);
          continue;
        }

        state.lastTimestamp = timestamp;

        // --- Mensaje de IA ---
        if (aiMessageRead) {
          if (aiMessageParse.includes("nombre")) {
            console.log("La IA preguntó por el nombre. Esperando respuesta del usuario...");
            
            // Marcar en memoria y Firestore que estamos esperando el nombre
            userLeads[psid] = { waitingForName: true };
            state.waitingForName = true;
            await saveUserState(psid, state);

            console.log("Estado actualizado en Firestore:", state);
          } else {
            console.log("IA aún no pregunta el nombre");
          }
          continue; // No procesar como respuesta de usuario
        }

        // --- Respuesta del Usuario ---
        if ((userLeads[psid]?.waitingForName || state.waitingForName) && psid !== 111177551895213) {
          const userName = text;
          console.log("Usuario escribió su nombre:", userName);

          // Guardar el nombre en Firestore y Sheets
          state.nombre = userName;
          state.waitingForName = false;
          await saveUserState(psid, state);
          //await saveLeadToSheets({ psid, nombre: userName });

          // Limpiar la memoria temporal
          if (userLeads[psid]) userLeads[psid].waitingForName = false;

          console.log("Nombre recibido y guardado para PSID", psid, ":", userName);
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