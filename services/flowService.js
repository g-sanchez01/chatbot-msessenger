import { getState, updateState, createState, deleteState, saveLead } from "./sheetsService.js"
import { sendMessage } from "./messengerService.js"
import OpenAI from "openai"
import dotenv from "dotenv";

dotenv.config();

// Cada vez que un usuario manda un mensaje, esta función se ejecuta.

// Inicializar OpenAI con API key
//const openai = new OpenAI({ apiKey: process.env.OPENAIKEY})

export const processMessage = async (psid, message) => {
    // Convertir mensaje a mayusculas para detectar la palabra ASISTENTE
    //const upperMessage = message.toUpperCase()

     // Si el usuario escribe "ASISTENTE", activar IA
    /*if (upperMessage === "ASISTENTE") {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un asistente amigable y útil de la página de Facebook." },
                { role: "user", content: "Hola, ayúdame con mi duda." }
            ],
            max_tokens: 200
        })

        const reply = response.choices[0].message.content
        return await sendMessage(psid, reply)
    }*/    

    // Obtiene el estado actual del usuario (si ya está en el flujo)
    const state = await getState(psid)

    // Si no tiene estado, iniciar flujo
    if (!state) {
        await createState(psid, "pidiendo_nombre")
        return await sendMessage(psid, "Hola 👋 ¿Cuál es tu nombre?")
    }

    // Captura nombre
    if (state.EstadoActual === "pidiendo_nombre") {
        await updateState(psid, { EstadoActual: "pidiendo_telefono", TempNombre: message })
        return await sendMessage(psid, "Perfecto, ¿cuál es tu teléfono?")
    }

    // Captura telefono
    if (state.EstadoActual === "pidiendo_telefono") {
        await updateState(psid, { EstadoActual: "pidiendo_localidad", TempTelefono: message})
        return await sendMessage(psid, "Por favor digame ¿Donde se ubica?")
    }

    // Captura localidad y fuarda todo en una sola fila
    if (state.EstadoActual === "pidiendo_localidad") {

        const nombre = state.TempNombre
        const telefono = state.TempTelefono
        const localidad = message

        // Guardar una sola fila completa
        await saveLead(psid, nombre, localidad, telefono)

        await deleteState(psid)
        
        return await sendMessage(psid, "Gracias por compartirme tus datos 😄. Tus datos se compartieron con nuestro Reclutamiento y te contactaran lo mas pronto posible.")
        //return await sendMessage(psid, "¿Tienes alguna otra duda? escribe exactamente la palabra 'ASISTENTE' para que te atienda nuestro asistente. 🥸")
    }
}