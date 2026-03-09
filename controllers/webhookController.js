import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseField } from "../services/leadParserService.js";

const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;

        if (!userLeads[psid]) {
          userLeads[psid] = {
            lead: new Lead(),
            waitingFor: "nombre" // primer pregunta
          };
          // enviar mensaje a usuario: "Hola, ¿cuál es tu nombre?"
          continue;
        }

        const state = userLeads[psid];
        const lead = state.lead;
        const text = event.message.text.trim();

        // Guardar según la pregunta que hizo la IA usando parseField
        if (state.waitingFor === "nombre") {
          const nombre = parseField(text, "nombre");
          if (nombre) {
            lead.nombre = nombre;
            state.waitingFor = "telefono";
            console.log("Nombre recibido:", lead.nombre);
            // enviar mensaje: "Gracias, ahora tu teléfono"
          } else {
            console.log("Mensaje ignorado, no es un nombre válido:", text);
          }

        } else if (state.waitingFor === "telefono") {
          const telefono = parseField(text, "telefono");
          if (telefono) {
            lead.telefono = telefono;
            state.waitingFor = "ciudad";
            console.log("Teléfono recibido:", lead.telefono);
            // enviar mensaje: "Ahora tu ciudad o dónde vives"
          } else {
            console.log("Mensaje ignorado, no es un teléfono válido:", text);
          }

        } else if (state.waitingFor === "ciudad") {
          const ciudad = parseField(text, "ciudad");
          if (ciudad) {
            lead.ciudad = ciudad;
            console.log("Ciudad recibida:", lead.ciudad);
            await saveLeadToSheets(lead);
            delete userLeads[psid];
            // enviar mensaje: "Gracias, tus datos fueron guardados"
          } else {
            console.log("Mensaje ignorado, no es una ciudad válida:", text);
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