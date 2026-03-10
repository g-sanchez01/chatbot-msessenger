import { saveUserName } from "../services/leadService.js";

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log ("Ejecutando handleWebhook...")

  const userLeads = {}; // estado por PSID

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const events = entry.messaging || entry.standby || [];

      for (const event of events) {
        // Ignorar eventos sin mensaje o sin texto
        if (!event.message || !event.message.text) continue;

        const psid = event.sender.id;
        const text = event.message.text.trim();
        const aiMessageRead = event.message.is_echo
        const aiMessageParse = text.toLowerCase()

        // Solo analizar mensajes de la IA (is_echo = true)
        // Detectar cuando la IA pregunta por el nombre
        if (aiMessageRead && aiMessageParse.includes("nombre")) {
          console.log("La IA preguntó por el nombre. Esperando respuesta del usuario...");
          userLeads[psid] = { waitingForName: true };
          continue;
        }


        // Guardar el nombre cuando el usuario responda
        if (userLeads[psid]?.waitingForName) {
          const userName = text;
          await saveUserName(psid, userName);
          userLeads[psid].waitingForName = false;
          console.log("Nombre recibido y guardado para PSID ", psid, ": ",userName);
        }
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