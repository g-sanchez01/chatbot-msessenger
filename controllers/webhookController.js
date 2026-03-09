import { processMessage } from "../services/flowService.js";

export const handleWebhook = async (req, res) => {

    console.log("Ejecutando Controller...")

    try {

        // =================================================
        // 1️⃣ VERIFICACIÓN DEL WEBHOOK (cuando lo configuras en Meta)
        // =================================================

        const metodo = req.method
        console.log("Metodo: ",metodo)
        if (req.method === "GET") {

            const metodo = req.method
            console.log(metodo)

            const mode = req.query["hub.mode"];
            const token = req.query["hub.verify_token"];
            const challenge = req.query["hub.challenge"];

            // Meta envía un token para verificar el webhook
            if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {

                console.log("Webhook verificado correctamente ✅");

                // Debemos devolver el challenge
                return res.status(200).send(challenge);

            }

            console.log("Webhook no autorizado ❌");
            return res.sendStatus(403);
        }

        // =================================================
        // 2️⃣ EVENTOS DE MENSAJES
        // =================================================
        if (req.method === "POST") {

            const recibeMensaje = req.body.object            
            console.log("Evento de mensaje: ",recibeMensaje)
            // Verificar que el evento provenga de Messenger
            if (req.body.object !== "page") {
                return res.sendStatus(404);
            }

            console.log("Mensaje: ", )

            const entries = req.body.entry || [];

            for (const entry of entries) {

                const events = entry.messaging || [];

                for (const event of events) {

                    // Ignorar eventos sin mensaje
                    if (!event.message) continue;

                    // Ignorar mensajes enviados por el propio bot
                    if (event.message.is_echo) continue;

                    const psid = event?.sender?.id;
                    const message = event?.message?.text;

                    if (!psid || !message) continue;

                    const text = message.trim();

                    console.log(`📩 Usuario ${psid}: ${text}`);

                    try {

                        console.log("1. mensaje recibido")
                        // Aquí enviamos el mensaje al flujo del bot
                        await processMessage(psid, text);

                        console.log("2. proceso terminado")

                    } catch (error) {

                        console.error("Error procesando mensaje:", error);

                    }

                }

            }

            // IMPORTANTE:
            // Messenger necesita siempre un 200
            // o reenviará el evento muchas veces

            return res.sendStatus(200);

        }

        return res.sendStatus(405);

    } catch (error) {

        console.error("Error general en webhook:", error);
        return res.sendStatus(500);

    }
};