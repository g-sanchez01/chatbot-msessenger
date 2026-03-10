import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";

const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;
        const text = event.message.text.trim();
        console.log("PSID:", psid);
        console.log("Mensaje:", text);

        // inicializar estado del usuario
        if (!userLeads[psid]) {
          userLeads[psid] = {
            lead: new Lead(),
            waitingFor: null
          };
        }

        const estadoUsuario = userLeads[psid];
        const lead = estadoUsuario.lead;
        const mensajeParse = text.toLowerCase();

        // 1️⃣ Detectar mensaje de la IA (echo = true)
        if (event.message.is_echo) {
          if (mensajeParse.includes("nombre")) {
            estadoUsuario.waitingFor = "nombre";
            console.log("IA preguntó por el nombre");
          }
          // aquí podrías hacer lo mismo para "teléfono" o "ciudad"
          continue; // no procesamos la respuesta todavía
        }

        // 2️⃣ Guardar la respuesta del usuario solo si estamos esperando algo
        if (estadoUsuario.waitingFor === "nombre") {
          lead.nombre = text;
          estadoUsuario.waitingFor = null;
          console.log("Nombre del usuario guardado:", lead.nombre);
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
