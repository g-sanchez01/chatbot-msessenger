import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";

const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        // ignorar mensajes sin texto o mensajes de la propia IA (echo)
        if (!event.message || !event.message.text || event.message.is_echo) continue;

        const psid = event.sender.id;
        const text = event.message.text.trim();
        console.log("PSID: ", psid)
        console.log("text: ", text)

        const estadoUsuario = userLeads[psid]

        // inicializar estado del usuario
        if (!estadoUsuario) {
            estadoUsuario = {
                lead: new Lead(),
                waitingFor: null // no estamos esperando nada hasta que la IA haga la pregunta
            };

            console.log(estadoUsuario)
        }

        const state = userLeads[psid];
        const lead = state.lead;

        // Detectar cuál es la pregunta de la IA por el contenido del mensaje
        if (/nombre/i.test(event.message.text)) {
          state.waitingFor = "nombre";
          console.log("IA preguntó por el nombre");
          continue; // no procesamos la respuesta todavía
        }

        // Solo guardar la respuesta si estamos esperando un dato
        if (state.waitingFor === "nombre") {
          lead.nombre = text;
          console.log("Nombre guardado:", lead.nombre);
          state.waitingFor = null;
          await saveLeadToSheets(lead);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(200);
  }
}

// Para verificación de webhook de Meta
export function verifyWebhook(req, res) {
    console.log("Verificando Webhook...")

    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("Webhook verificado!");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
}
