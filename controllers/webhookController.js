export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log ("Ejecutando handleWebhook...")

  try {
    const entries = req.body.entry || [];

    for (const entry of entries ) {
      const messaging = entry.messaging || [];
      console.log(messaging)

      for (const event of messaging) {
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;
        const text = event.message.text;

        console.log("PSID: " , psid, "Text: ", text)
      }
    }

  } catch (error) {
    console.error("Error en webhook:", error);
  }
} 

// Verificación de webhook
export function verifyWebhook(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}