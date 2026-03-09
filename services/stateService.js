// Este objeto guarda los datos temporalmente en memoria usando el PSID del usuario identificador.

const leads = {}

// Obtener lead actual
export function getLead(psid) {
     if (!leads[psid]) {
        leads[psid] = {
            nombre: null,
            telefono: null,
            localidad: null,
            guardado: false
        }
    }

    return leads[psid]
}

// Actualizar datos del lead
export function updateLead(psid, data) {

    leads[psid] = {
        ...leads[psid],
        ...data
    }

    return leads[psid]
}