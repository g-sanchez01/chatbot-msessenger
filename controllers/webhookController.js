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

        // inicializar estado del usuario
       if (!userLeads[psid]) {
            userLeads[psid] = {
                lead: new Lead(),
                waitingFor: null
            };
        }

        const estadoUsuario = userLeads[psid]; // ahora const está bien
        const lead = estadoUsuario.lead;
        console.log("Estado usuario: ", lead)

        const mensajeParse = event.message.text.toLowerCase()
        console.log(mensajeParse)

       // Detectar pregunta de la IA
        if (mensajeParse.includes("nombre") && event.message.is_echo) { 
            // is_echo indica que el mensaje es de la IA (tu página/servicio) y no del usuario
            estadoUsuario.waitingFor = "nombre";
            console.log("IA preguntó por el nombre");
            continue; // no procesamos respuesta todavía
        } else {
            console.log("La IA no pregunto por el nombre")
        }

        // Guardar la respuesta del usuario solo si estamos esperando nombre
        if (estadoUsuario.waitingFor === "nombre" && !event.message.is_echo) {
            estadoUsuario.lead.nombre = event.message.text.trim();
            estadoUsuario.waitingFor = null; // ya no estamos esperando
            console.log("Nombre del usuario guardado:", estadoUsuario.lead.nombre);
            await saveLeadToSheets(estadoUsuario.lead);
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
