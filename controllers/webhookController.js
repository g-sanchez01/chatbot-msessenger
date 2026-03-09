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

        // Detectar cuál es la pregunta de la IA por el contenido del mensaje
        if (mensajeParse.includes("nombre")) {
          estadoUsuario.waitingFor = "nombre";
          console.log("IA preguntó por el nombre");
          continue; // no procesamos la respuesta todavía
        } else {
            console.log("La IA no pregunto por el nombre")
        }

        // Solo guardar la respuesta si estamos esperando un dato
        if (estadoUsuario.waitingFor === "nombre") {
          lead.nombre = text;
          console.log("Nombre guardado:", lead.nombre);
          estadoUsuario.waitingFor = null;
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
