import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";

const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
    console.log("Entrando al Controller...")
    //console.log("Webhook body:", JSON.stringify(req.body, null, 2));
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
                    // Aquí enviar mensaje a usuario: "Hola, ¿cuál es tu nombre?"
                    continue;
                }

                const state = userLeads[psid];
                const lead = state.lead;
                const text = event.message.text.trim();

                // Guardar según la pregunta que hiciste
                if (state.waitingFor === "nombre") {
                    lead.nombre = text;
                    state.waitingFor = "telefono";
                    // enviar mensaje: "Gracias, ahora tu teléfono"
                } else if (state.waitingFor === "telefono") {
                    lead.telefono = text;
                    state.waitingFor = "ciudad";
                    // enviar mensaje: "Ahora tu ciudad o dónde vives"
                } else if (state.waitingFor === "ciudad") {
                    lead.ciudad = text;
                    // todos los datos completos, guardar en Sheets
                    await saveLeadToSheets(lead);
                    delete userLeads[psid];
                    // enviar mensaje: "Gracias, tus datos fueron guardados"
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Error en webhook:", error);
        res.sendStatus(200); // siempre responder 200 a Meta
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