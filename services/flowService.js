import { detectIntent } from "./aiIntentService.js"
import { generateInfo } from "./aiResponseService.js"

import { extractData } from "../models/stateModel.js"
import { getLead, updateLead } from "./stateService.js"

import { sendMessage } from "./sendMessageService.js"
import { saveLead } from "./sheetsService.js"


export async function processMessage(psid, message) {

    console.log("3. llamando IA")
    const lead = getLead(psid)

    // ============================
    // SI NO ESTAMOS CAPTURANDO DATOS
    // ============================

    if (!lead.capturando) {

        const intent = await detectIntent(message)

        // SOLO INFORMACIÓN
        if (intent === "INFO") {

            const response = await generateInfo(message)

            await sendMessage(psid, response)

            return
        }

        // USUARIO INTERESADO
        if (intent === "INTERESADO") {

            updateLead(psid, { capturando: true })

            await sendMessage(
                psid,
                "Perfecto 👍 Para ayudarte necesito algunos datos.\n\n¿Cuál es tu nombre?"
            )

            return
        }

    }

    // ============================
    // CAPTURA DE DATOS
    // ============================

    const data = extractData(message)

    const updatedLead = updateLead(psid, {
        nombre: data.nombre || lead.nombre,
        telefono: data.telefono || lead.telefono,
        localidad: data.localidad || lead.localidad
    })

    if (!updatedLead.nombre) {
        await sendMessage(psid, "¿Cuál es tu nombre?")
        return
    }

    if (!updatedLead.telefono) {
        await sendMessage(psid, "¿Cuál es tu teléfono?")
        return
    }

    if (!updatedLead.localidad) {
        await sendMessage(psid, "¿En qué ciudad te encuentras?")
        return
    }

    // ============================
    // GUARDAR LEAD
    // ============================

    if (!updatedLead.guardado) {

        await saveLead(updatedLead)

        await sendMessage(
            psid,
            "✅ Gracias. Hemos guardado tu información y pronto te contactaremos."
        )

        updateLead(psid, { guardado: true })
    }

}