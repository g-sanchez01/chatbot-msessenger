import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseField } from "../services/leadParserService.js";

const userLeads = {}; // estado por PSID

export async function handleWebhook(req, res) {
    console.log("Ejecutando controller...")
    try {
        const entries = req.body.entry || [];

        for (const entry of entries) {
            const events = entry.messaging || entry.standby || [];

            for (const event of events) {
                if (!event.message || !event.message.text) continue;

                const psid = event.sender.id;
                const text = event.message.text.trim();

                // Crear estado si no existe
                if (!userLeads[psid]) {
                    userLeads[psid] = {
                        lead: new Lead(),
                        lastIAQuestion: null,
                    };
                    console.log("Nuevo usuario, esperando nombre...");
                    continue; // aquí salimos y no intentamos usar lead todavía
                }

                const state = userLeads[psid]
                const lead = state.lead; // ya seguro que existe
                console.log("lead: ", lead)

                // Detectar si el mensaje recibido es de la IA preguntando por un dato
                if (event.message.is_echo && event.message.text) {
                    console.log("Es mensaje de la IA...")
                    const iaMsg = text.toLowerCase();

                    console.log("La IA dice: ",iaMsg)
                    if (iaMsg.includes("nombre")) {
                        state.lastIAQuestion = "nombre";
                    } else if (iaMsg.includes("teléfono") || iaMsg.includes("celular")) {
                        state.lastIAQuestion = "telefono";
                    } else if (iaMsg.includes("ciudad") || iaMsg.includes("dónde vives")) {
                        state.lastIAQuestion = "ciudad";
                    }
                    continue; // solo actualizamos la última pregunta de la IA
                }

                // Solo guardar si sabemos cuál fue la pregunta de la IA
                if (state.lastIAQuestion) {
                    const field = state.lastIAQuestion;
                    const value = parseField(text, field);

                    if (value) {
                    lead[field] = value;
                    console.log(`${field} recibido:`, value);

                    // Resetear la última pregunta de la IA para que no acepte otros mensajes
                    state.lastIAQuestion = null;

                    // Si ya tenemos todos los datos, guardar en Sheets
                    if (lead.nombre && lead.telefono && lead.ciudad) {
                        await saveLeadToSheets(lead);
                        delete userLeads[psid];
                        console.log("Todos los datos guardados en Sheets");
                    }
                    } else {
                        console.log(`Mensaje ignorado, no es un ${field} válido:`, text);
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