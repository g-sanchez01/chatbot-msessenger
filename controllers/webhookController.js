import { processMessage } from "../services/flowService.js";

export const handleWebhook = async (req, res) => {
    try {
        // VERIFICACIÓN DEL WEBHOOK (GET)
        if (req.method === "GET") {
            const mode = req.query["hub.mode"];
            const token = req.query["hub.verify_token"];
            const challenge = req.query["hub.challenge"];

            if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
                console.log("Webhook verificado correctamente");
                return res.status(200).send(challenge);
            } else {
                return res.sendStatus(403);
            }
        }

        // EVENTOS DE MENSAJES (POST)
        if (req.method === "POST") {
            const entry = req.body.entry || [];

            for (const e of entry) {
                const messagingEvents = e.messaging || [];

                for (const event of messagingEvents) {
                    console.log("event:", event);

                    // Ignorar eventos que NO sean mensajes de texto del usuario
                    if (
                        !event.message ||
                        !event.message.text ||
                        event.message.is_echo ||     // 👈 Ignora mensajes enviados por el bot
                        event.delivery ||            // 👈 Ignora confirmaciones de entrega
                        event.read                   // 👈 Ignora confirmaciones de lectura
                    ) {
                        continue;
                    }

                    const psid = event.sender?.id;
                    const message = event.message.text;

                    console.log(`Mensaje recibido de ${psid}: "${message}"`);

                    try {
                        await processMessage(psid, message); // tu función que envía mensaje
                    } catch (err) {
                        console.error("Error en processMessage:", err.response?.data || err);
                        // No lanzamos error para que no se genere 500
                    }
                }
            }

            return res.sendStatus(200); // siempre responder 200 a Facebook
        }

        // Método no soportado
        return res.sendStatus(405);
    } catch (error) {
        console.error("Error en handleWebhook general:", error);
        return res.sendStatus(200); // prevenir que Facebook marque el webhook como caído
    }
};