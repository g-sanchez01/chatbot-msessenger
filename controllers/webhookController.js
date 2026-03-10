import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseLead } from "../services/leadParserService.js";

const userLeads = {}; // estado por PSID (id usuario)

export async function handleWebhook(req, res) {
  console.log("Ejecutando handleWebhook...")

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {

      const events = entry.messaging || entry.standby || [];

      for (const event of events) {

        if (!event.message || !event.message.text) continue;

        console.log("Envió mensaje:", event.sender?.id, "Recibió el mensaje:", event.recipient?.id);

        const psid = event.sender.id;
        const text = event.message.text.trim();
        const aiMessage = event.message.is_echo; // Lectura de mensaje de la IA

        console.log("PSID:", psid, "Mensaje recibido:", text);

        // Solo analizar mensajes de la IA
        if (aiMessage) {
          console.log("Mensaje de la IA detectado para PSID:", psid, "mensaje:", text);
        }

      } // ← cierre for events

    } // ← cierre for entries

    res.sendStatus(200);

  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(200);
  }
}

// Verificación de webhook
export function verifyWebhook(req, res) {
  console.log ("Ejecutando verifyWebhook...")
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

// Función para hacer delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}