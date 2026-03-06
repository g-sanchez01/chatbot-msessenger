import { google } from "googleapis"
import dotenv from "dotenv"

dotenv.config()

const creds = JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON)

// memoria temporal de leads
const leads = {}

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

    if (!leads[psid]) {
        leads[psid] = {}
    }

    leads[psid] = {
        ...leads[psid],
        ...data
    }

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

    // solo guardar si ya tiene todo
    if (!nombre || !telefono || !localidad) {
        return
    }

    // evitar duplicados
    if (lead.guardado) return

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