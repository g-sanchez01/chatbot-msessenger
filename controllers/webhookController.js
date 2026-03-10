import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { getUserState, saveUserState } from "../services/firestoreService.js";
import { saveMessage } from "../services/messageService.js";
import { saveLead } from "../services/leadService.js";

const processedMessages = new Set();

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  console.log ("Ejecutando handleWebhook...")

  try {
    const entries = req.body.entry || []; // son los grupos de eventos que Meta envía.

    // Itera sobre cada entry en el webhook.
    for (const entry of entries) { // Cada entry puede contener varios eventos de mensajes o interacciones.
      // Dentro de cada entry, buscamos los eventos de mensajería
      const events = entry.messaging || entry.standby || []; // messaging → mensajes activos que envía o recibe la página. standby → eventos que están en espera (por ejemplo cuando hay otra IA conectada).

      // Itera sobre cada evento dentro de esa entry.
      for (const event of events) { // Cada event puede ser un mensaje del usuario, de la IA, o un sistema (echo, delivery, postback, etc.).
        
        if (!event.message || !event.message.text) continue; // Ignora cualquier evento que no tenga un mensaje o que el mensaje no tenga texto.
        
        //console.log("Envió mensaje:", event.sender?.id, "Recibió el mensaje:", event.recipient?.id);  
       
        const psid = event.sender?.id;
        const text = event.message.text.trim();
<<<<<<< HEAD
        const mid = event.message.mid;
        const timestamp = event.timestamp || Date.now();
        const aiMessageRead = event.message.is_echo === true;
=======
        const aiMessage = event.message.is_echo // Lecutra de mensaje de la IA
>>>>>>> parent of 3777b72 (Update webhookController.js)

        if (!psid || !mid) continue; // Si no existe psid salta al siguiente.

        // EVITAR DUPLICADOS
        if (processedMessages.size > 10000) {
          processedMessages.clear();
        }

        processedMessages.add(mid);

        const state = await getUserState(psid); // Obtener estado desde Firestore

        // ignorar eventos viejos
        if (timestamp <= state.lastTimestamp) {
          console.log("Evento antiguo ignorado:", timestamp);
          continue;
        }
        state.lastTimestamp = timestamp; // actualizar ultimo evento procesado

        // Solo analizar mensajes de la IA (is_echo = true)
<<<<<<< HEAD
        if (aiMessageRead) {
          console.log("Mensaje de IA detectado:", text);

          await saveMessage(psid, text, "bot");

          const aiMessage = text.toLowerCase(); // Parseamos el mensaje de la IA

          // Detecta que tipo de pregunta hizo la IA segun la palabra clave
          if (aiMessage.includes("nombre")) {
            console.log("La IA pregunto por el nombre al usuario");

            state.waitingFor = "nombre";

            console.log("Estado actualizado:", state.waitingFor);
          } else {
            console.log("La IA no ha preguntado aun por el nombre");
          }

          await saveUserState(psid, state);
          continue
=======
        if (aiMessage) {
          console.log("Mensaje de la IA detectado para PSID:",psid , "mensaje: ",text)
>>>>>>> parent of 3777b72 (Update webhookController.js)
        }

        // Respuesta del Usuario
        console.log("Usuario respondio: ", text)

        await saveMessage(psid, text, "user");

        const estadoEsperado = state.waitingFor

        console.log("Estado Esperado del Usuario: ", estadoEsperado)

        if (estadoEsperado === "nombre") {

          state.nombre = text;
          state.waitingFor = null;

          await saveUserState(psid, state);

          console.log("Nombre guardado:", state.nombre);

          const lead = new Lead(state.nombre, null, null);
          lead.psid = psid;

          await saveLead(lead);

          await saveLeadToSheets(lead);

        } else {
          await saveUserState(psid, state);
        }

      }
    }
  } catch (error) {
    console.error("Error en webhook:", error);
    //res.sendStatus(200);
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