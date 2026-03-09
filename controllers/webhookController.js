import { processMessage } from "../services/flowService.js";

export const handleWebhook = async (req, res) => {

    try {

        // ===============================
        // VERIFICACIÓN DEL WEBHOOK (GET)
        // ===============================
        if (req.method === "GET") {

            const mode = req.query["hub.mode"];
            const token = req.query["hub.verify_token"];
            const challenge = req.query["hub.challenge"];

            if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {

                console.log("Webhook verificado correctamente ✅");
                return res.status(200).send(challenge);

            } else {

                console.log("Error verificando webhook ❌");
                return res.sendStatus(403);

            }
        }

        // ===============================
        // EVENTOS DE MENSAJES (POST)
        // ===============================
        if (req.method === "POST") {

            const entries = req.body.entry || [];

            for (const entry of entries) {

                const messagingEvents = entry.messaging || [];

                for (const event of messagingEvents) {

                    console.log("Evento recibido:", JSON.stringify(event, null, 2));

                    // Ignorar eventos que no sean mensajes
                    if (!event.message) continue;

                    // Ignorar mensajes enviados por la página o bot
                    if (event.message.is_echo) continue;

                    // Ignorar eventos sin texto
                    if (!event.message.text) continue;

                    const psid = event.sender?.id;
                    const message = event.message.text.trim();

                    if (!psid || !message) continue;

                    console.log(`Mensaje recibido de ${psid}: "${message}"`);

                    try {

                        // Procesar el mensaje para extraer datos
                        await processMessage(psid, message);

                    } catch (error) {

                        console.error("Error en processMessage:", error);

                    }
                }
            }

            // IMPORTANTE: siempre responder 200
            // para que Messenger no reintente
            return res.sendStatus(200);
        }

        return res.sendStatus(405);

    } catch (error) {

        console.error("Error general en webhook:", error);

        // Evitar que Meta piense que el webhook falló
        return res.sendStatus(200);

    }
};
