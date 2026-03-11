import { getUserState, saveUserState } from "./firestoreService.js";
import { saveLeadToSheets } from "./sheetsService.js";
import { UserState } from "../models/userStateModel.js";

const processedMessages = new Set();

export async function processMessengerEvent(event) {

  if (!event.message || !event.message.text) return;

  const isEcho = event.message.is_echo;

  const psid = isEcho
    ? event.recipient.id
    : event.sender.id;

  const text = event.message.text.trim();
  const mid = event.message.mid;
  const timestamp = event.timestamp || Date.now();

  const aiMessageRead = event.message.is_echo;
  const aiMessageParse = text.toLowerCase();

  if (!psid || !mid) return;

  if (processedMessages.has(mid)) return;
  processedMessages.add(mid);

  let state = await getUserState(psid);

  if (!state) {
    state = new UserState();
  }

  if (timestamp <= state.lastTimestamp) return;

  state.lastTimestamp = timestamp;

  // --- Mensaje IA ---
  if (aiMessageRead) {

    if (aiMessageParse.includes("nombre")) {
      console.log(`IA preguntó por el nombre. PSID: ${psid}`);

      state.waitingForName = true;

      await saveUserState(psid, state);
    }

    return;
  }

  console.log("Esperando respuesta usuario", psid, text);

  // --- Respuesta usuario ---
  if (state.waitingForName && psid !== 111177551895213) {

    const userName = text;

    console.log("Usuario escribió nombre:", userName);

    state.nombre = userName;
    state.waitingForName = false;

    await saveUserState(psid, state);

    await saveLeadToSheets({
      psid,
      nombre: userName
    });

    console.log("Nombre guardado:", userName);
  }
}