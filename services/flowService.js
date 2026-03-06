import { getLead, updateLead, saveLead } from "./sheetsService.js"
import { extractData } from "../models/stateModel.js"

export const processMessage = async (psid, message) => {

    const leadActual = getLead(psid) || {
        nombre: null,
        telefono: null,
        localidad: null
    }

    // extraer datos del mensaje
    const data = extractData(message)

    // actualizar memoria
    const leadActualizado = updateLead(psid, {
        nombre: data.nombre || leadActual.nombre,
        telefono: data.telefono || leadActual.telefono,
        localidad: data.localidad || leadActual.localidad
    })

    // si ya tiene todos los datos, guardar en Sheets
    if (leadActualizado.nombre && leadActualizado.telefono && leadActualizado.localidad) {
        await saveLead(psid) // <- solo psid, no más argumentos
    }

    console.log("Lead Actualizado:", {
        nombre: leadActualizado.nombre,
        telefono: leadActualizado.telefono,
        localidad: leadActualizado.localidad,
        guardado: leadActualizado.guardado || false
    })
}