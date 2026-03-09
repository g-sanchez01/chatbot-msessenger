import { Lead } from "../models/leadModel.js";
import { parseField } from "../services/leadParserService.js";
import { saveLeadToSheets } from "../services/sheetsService.js";

const userLeads = {}; // estado en memoria por PSID
console.log("Ejecutando controller...")
export async function handleWebhook(req, res) {
    const entries = req.body.entry || [];

    for (const entry of entries) {
        const events = entry.messaging || entry.standby || [];

        for (const event of events) {
            if (!event.message || !event.message.text) continue;

            const psid = event.sender.id;
            if (!userLeads[psid]) userLeads[psid] = new Lead();
            const lead = userLeads[psid];

            // Captura nombre
            if (!lead.nombre) {
                const nombre = parseField(event.message.text, "nombre");
                if (nombre) {
                    lead.nombre = nombre;
                    console.log(`Nombre capturado: ${nombre}`);
                    // Aquí enviar mensaje a usuario: "Gracias, ahora tu teléfono"
                    continue;
                }
            }

            // Captura teléfono
            if (!lead.telefono) {
                const tel = parseField(event.message.text, "telefono");
                if (tel) {
                    lead.telefono = tel;
                    console.log(`Teléfono capturado: ${tel}`);
                    // Mensaje a usuario: "Ahora tu ciudad"
                    continue;
                }
            }

            // Captura ciudad
            if (!lead.ciudad) {
                const ciudad = parseField(event.message.text, "ciudad");
                if (ciudad) {
                    lead.ciudad = ciudad;
                    console.log(`Ciudad capturada: ${ciudad}`);
                }
            }

            // Guardar en Sheets si todos los datos están completos
            if (lead.isComplete()) {
                await saveLeadToSheets(lead);
                delete userLeads[psid]; // limpiar estado
            }
        }
  }

  res.sendStatus(200);
}

// Verificación de webhook
export function verifyWebhook(req, res) {
    console.log("Verificando webhook...")
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