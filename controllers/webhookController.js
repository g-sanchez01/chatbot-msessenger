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
        console.log("Mensaje recibido:", text);

        // Inicializar estado del usuario
        if (!userLeads[psid]) {
          userLeads[psid] = {
            lead: new Lead(),
            waitingFor: null // No esperamos nada hasta que la IA haga la pregunta
          };
        }

        const estadoUsuario = userLeads[psid];
        const lead = estadoUsuario.lead;
        const mensajeParse = text.toLowerCase();

        // Regex para detectar las preguntas de la IA
        const preguntaNombre = /cu(á|a)l es tu nombre/i;

        // 1️⃣ Detectar la pregunta de la IA y marcar lo que estamos esperando
        if (preguntaNombre.test(mensajeParse)) {
          estadoUsuario.waitingFor = "nombre";
          console.log("IA preguntó por el nombre");
          continue; // no procesamos la respuesta todavía
        }

        // 2️⃣ Guardar la respuesta del usuario solo si estamos esperando ese dato
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
    res.sendStatus(200); // siempre responder 200 a Meta
  }
}

// Verificación de webhook de Meta
export function verifyWebhook(req, res) {
  console.log("Verificando Webhook...");

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