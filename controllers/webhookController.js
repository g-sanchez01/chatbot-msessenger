import { saveLeadToSheets } from "../services/sheetsService.js";
import { Lead } from "../models/leadModel.js";
import { parseLead } from "../services/leadParserService.js";

const userState = {}; // estado por PSID (id usuario)

export async function handleWebhook(req, res) {
  res.sendStatus(200);
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
        const aiMessageRead = event.message.is_echo === true; // Lecutra de mensaje de la IA
        const timestamp = event.timestamp || Date.now();
        const mid = event.message.mid

        if (!psid || !mid) continue; // Si no existe psid salta al siguiente.

        // EVITAR DUPLICADOS
        if (processedMessages.has(mid)) {
          console.log("Mensaje duplicado ignorado:", mid);
          continue;
        }

        processedMessages.add(mid);

        // Inicializar memoria del usuario
        if (!userState[psid]) { // Si no existe todavía un estado guardado para este usuario…
          userState[psid] = {
            waitingFor: null, // Qué dato está esperando la IA (nombre, teléfono, etc.)
            nombre: null, // El nombre que el usuario ya proporcionó
            lastTimestamp: 0
          }
        }

        const state = userState[psid]

        // ignorar eventos viejos
        /*if (timestamp <= state.lastTimestamp) {
          console.log("Evento antiguo ignorado:", timestamp);
          continue;
        }

        // actualizar ultimo evento procesado
        state.lastTimestamp = timestamp;

        //console.log("PSID: ", psid, "Mensaje recibido: ", text)*/

        // Solo analizar mensajes de la IA (is_echo = true)
        if (aiMessageRead) {
          console.log("Mensaje de la IA detectado para PSID:",psid , "mensaje: ",text)

          const aiMessage = text.toLowerCase(); // Parseamos el mensaje de la IA

          // Detecta que tipo de pregunta hizo la IA segun la palabra clave
          if ( aiMessage.includes("nombre") ) {
            console.log("La IA pregunto por el nombre al usuario");
            state.waitingFor = "nombre";
          } else {
            console.log("La IA no ha preguntado aun por el nombre");
          }
          continue
        }

        // Respuesta del Usuario
        console.log("Usuario respondio: ", text)
        const estadoEsperado = state.waitingFor
        console.log("Estado Esperado del Usuario: ", estadoEsperado)

        if (estadoEsperado === "nombre") {
          state.nombre = text;
          state.waitingFor = null;

          console.log("Nombre guardado", state.nombre)
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

// Función para hacer delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}