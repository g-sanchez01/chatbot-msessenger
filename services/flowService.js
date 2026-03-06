import { getLead, updateLead, saveLead } from "./sheetsService.js"
import { extractData } from "../models/stateModel.js"

export const processMessage = async (psid, message) => {

    const data = extractData(message)

    const leadActual = getLead(psid) || {
        nombre: null,
        telefono: null,
        localidad: null
    }

    const leadActualizado = updateLead(psid, {
        nombre: data.nombre || leadActual.nombre,
        telefono: data.telefono || leadActual.telefono,
        localidad: data.localidad || leadActual.localidad
    })

    // Si ya tenemos todos los datos, guardar en sheets
    if (
        leadActualizado.nombre &&
        leadActualizado.telefono &&
        leadActualizado.localidad
    ) {
        await saveLead(
            psid,
            leadActualizado.nombre,
            leadActualizado.localidad,
            leadActualizado.telefono
        )
    }

    console.log("Lead Actualizado:", {
        nombre: leadActualizado.nombre,
        telefono: leadActualizado.telefono,
        localidad: leadActualizado.localidad,
        guardado: leadActualizado.guardado || false
    })
}