import { parseLead } from "../services/leadParserService.js";
import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";

export async function handleWebhook(req, res) {
    console.log("Entrando al Controller...")
    //console.log("Webhook body:", JSON.stringify(req.body, null, 2));
    try {
        const entries = req.body.entry || [];

         for (const entry of entries) {
            // Leer mensajes normales o standby (IA de Meta dueña del hilo)
            const events = entry.messaging || entry.standby || [];

            for (const event of events) {
                if (event.message && event.message.text) { // Solo mensajes que contienen texto
                    // Analizar o guardar segun la intención
                    const data = parseLead(event.message.text);
                    console.log("Datos detectados:", data);

                    if (data.nombre || data.telefono || data.ciudad) {
                        const lead = new Lead(data.nombre, data.telefono, data.ciudad);
                        console.log("Guardando lead:", lead);
                        await saveLeadToSheets(lead);
                    } else {
                        console.log("No se detectaron datos en el mensaje:", event.message.text);
                    }
                    
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