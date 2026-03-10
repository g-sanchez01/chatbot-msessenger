import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseLead } from "../services/leadParserService.js";

const userLeads = {}; // estado por PSID (id usuario)

export async function handleWebhook(req, res) {
  console.log ("Ejecutando handleWebhook...")
  try {
    const entries = req.body.entry || []; // son los grupos de eventos que Meta envía.
    //console.log("Grupo de Eventos: ", entries.standby)

    // Itera sobre cada entry en el webhook.
    for (const entry of entries) { // Cada entry puede contener varios eventos de mensajes o interacciones.
      // Dentro de cada entry, buscamos los eventos de mensajería
      const events = entry.messaging || entry.standby || []; // messaging → mensajes activos que envía o recibe la página. standby → eventos que están en espera (por ejemplo cuando hay otra IA conectada).

      // Itera sobre cada evento dentro de esa entry.
      for (const event of events) { // Cada event puede ser un mensaje del usuario, de la IA, o un sistema (echo, delivery, postback, etc.).
        
        if (!event.message || !event.message.text) continue; // Ignora cualquier evento que no tenga un mensaje o que el mensaje no tenga texto.
        
        //console.log("Envió mensaje:", event.sender?.id, "Recibió el mensaje:", event.recipient?.id);  
       
        const psid = event.sender.id;
        const text = event.message.text.trim();
        const aiMessageRead = event.message.is_echo // Lecutra de mensaje de la IA

        //console.log("PSID: ", psid, "Mensaje recibido: ", text)

        // Solo analizar mensajes de la IA (is_echo = true)
        if (aiMessageRead) {
          console.log("Mensaje de la IA detectado para PSID:",psid , "mensaje: ",text)

          const aiMessage = text.toLowerCase(); // Parseamos el mensaje de la IA

          // Detecta que tipo de pregunta hizo la IA segun la palabra clave
          if ( aiMessage.includes("nombre") ) {
            console.log("La IA pregunto por el nombre al usuario");
          } else {
            console.log("La IA no ha preguntado aun por el nombre");
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

// Verificación de webhook
export function verifyWebhook(req, res) {
  //console.log ("Ejecutando verifyWebhook...")
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

// Función para hacer delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}