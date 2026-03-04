import { google } from "googleapis"
import dotenv from "dotenv"

dotenv.config()
const creds = JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON);
const states = {} // Almacenar datos en memoria.

// Configuracion de google sheets
const auth = new google.auth.GoogleAuth({
    keyFile: creds, // archivo que descargaste
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })

// ============== ESTADOS =================

// Esta función devuelve el estado actual de un usuario según su psid
export async function getState(psid) {
    return states[psid]
}

// Crea un nuevo estado para un usuario. Guarda un objeto con la propiedad EstadoActual.
export async function createState(psid, estado) {
    states[psid] = { EstadoActual: estado }
    return states[psid]
}

// Actualiza el estado existente de un usuario agregando o sobrescribiendo campos.
export async function updateState(psid, campos) {
    if (!states[psid]) return null
    states[psid] = { ...states[psid], ...campos } // ...states[psid] mantiene los datos previos y ...campos agrega o modifica lo nuevo.
    return states[psid]
}

// Borra completamente el estado de un usuario cuando termina el flujo.
export async function deleteState(psid) {
    delete states[psid]
}

// ==================== GUARDAR EN GOOGLE SHEETS

// Aquí simulas guardar los datos de contacto del usuario (nombre y teléfono).
export async function saveLead(psid, nombre, localidad, telefono) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Leads!A:D", // ⚠️ Cambia "Hoja1" si tu pestaña tiene otro nombre
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[psid, nombre, localidad, telefono]],
            },
        })

        console.log("Lead guardado en Google Sheets")

    } catch (error) {
        console.error("Error guardando en Sheets ❌", error)
    }
}