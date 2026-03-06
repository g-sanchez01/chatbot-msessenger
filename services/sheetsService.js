// sheetsService.js
import { google } from "googleapis"
import dotenv from "dotenv"

dotenv.config()

const creds = JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON)

// ================= MEMORIA TEMPORAL DE LEADS =================
export const leads = {}

// ================= GOOGLE SHEETS CONFIG =================
const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })

// ================== LEADS EN MEMORIA ===================

// obtener lead actual
export function getLead(psid) {
    return leads[psid] || {}
}

// actualizar datos del lead
export function updateLead(psid, data) {
    if (!leads[psid]) leads[psid] = {}
    leads[psid] = { ...leads[psid], ...data }
    return leads[psid]
}

// borrar lead de memoria
export function deleteLead(psid) {
    delete leads[psid]
}

// ================= GUARDAR EN GOOGLE SHEETS =================
export async function saveLead(psid) {
    const lead = leads[psid]
    if (!lead) return

    const { nombre, telefono, localidad } = lead

    if (!nombre || !telefono || !localidad) return // solo guardar si todo está completo
    if (lead.guardado) return // evitar duplicados

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Leads!A:E",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    psid,
                    nombre,
                    telefono,
                    localidad,
                    new Date().toISOString()
                ]]
            }
        })
        console.log("Lead guardado en Google Sheets ✅")
        leads[psid].guardado = true
    } catch (error) {
        console.error("Error guardando en Sheets ❌", error)
    }
}

// ================== EXTRACT DATA CONTEXTUAL ===================
export const extractData = (message, preguntaActual) => {
    const text = message.trim()
    let nombre = null
    let telefono = null
    let localidad = null

    const ciudades = ["monterrey","apodaca","guadalupe","escobedo","san nicolas"]

    switch (preguntaActual) {
        case "nombre":
            nombre = text
            break
        case "telefono":
            const match = text.match(/\d{10}/)
            telefono = match ? match[0] : null
            break
        case "localidad":
            const lower = text.toLowerCase()
            for (const ciudad of ciudades) {
                if (lower.includes(ciudad)) {
                    localidad = ciudad
                    break
                }
            }
            break
    }

    return { nombre, telefono, localidad }
}

// ================== PROCESAR MENSAJE ===================
export async function processMessage(psid, message) {
    const leadActual = getLead(psid)
    const preguntaActual = leadActual.preguntaActual || "nombre" // si no hay, empezar por nombre

    // extraer datos según la pregunta
    const data = extractData(message, preguntaActual)

    // actualizar lead en memoria
    const leadActualizado = updateLead(psid, { ...data })

    // determinar siguiente pregunta
    if (!leadActualizado.nombre) {
        leadActualizado.preguntaActual = "nombre"
    } else if (!leadActualizado.telefono) {
        leadActualizado.preguntaActual = "telefono"
    } else if (!leadActualizado.localidad) {
        leadActualizado.preguntaActual = "localidad"
    } else {
        leadActualizado.preguntaActual = null
        // ya tenemos todos los datos, guardar en Sheets
        await saveLead(psid)
    }

    return leadActualizado
}