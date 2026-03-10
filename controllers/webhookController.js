import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseLead } from "../services/leadParserService.js";

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

        // Inicializar estado del usuario si no existe
        if (!userLeads[psid]) {
          userLeads[psid] = {
            lead: new Lead(),
            waitingFor: null // solo espera lo que pregunte la IA
          };
        }

        const estadoUsuario = userLeads[psid];
        const lead = estadoUsuario.lead;

        // 1️⃣ Detectar la pregunta de la IA
        if (event.message.is_echo) { // mensaje de la IA
          if (text.toLowerCase().includes("nombre")) {
            estadoUsuario.waitingFor = "nombre";
            console.log("IA preguntó por el nombre");
          }
          continue; // no procesamos la respuesta
        }

        // 2️⃣ Guardar la respuesta del usuario solo si la IA preguntó
        if (estadoUsuario.waitingFor === "nombre") {
          const nombre = parseLead(text, "nombre");
          if (nombre) {
            lead.nombre = nombre;
            console.log("Nombre guardado:", nombre);

            // Guardar en Sheets
            await saveLeadToSheets(lead);

            // Limpiar estado
            delete userLeads[psid];
          } else {
            console.log("No se detectó un nombre válido:", text);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(200);
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