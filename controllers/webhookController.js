import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseLead } from "../services/leadParserService.js";

const userLeads = {}; // estado por PSID (id usuario)

export async function handleWebhook(req, res) {
  console.log ("Ejecutando handleWebhook...")
  try {
    const entries = req.body.entry || []; // son los grupos de eventos que Meta envía.
    console.log("Grupo de Eventos: ", entries)

    // Itera sobre cada entry en el webhook.
    for (const entry of entries) { // Cada entry puede contener varios eventos de mensajes o interacciones.
      // Dentro de cada entry, buscamos los eventos de mensajería
      const events = entry.messaging || entry.standby || []; // messaging → mensajes activos que envía o recibe la página. standby → eventos que están en espera (por ejemplo cuando hay otra IA conectada).
      console.log("Tipo de evento de mensajeria ", events)
      await sleep(300);
    }


    res.sendStatus(200);
  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(200);
  }
}

// Verificación de webhook
export function verifyWebhook(req, res) {
  console.log ("Ejecutando verifyWebhook...")
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