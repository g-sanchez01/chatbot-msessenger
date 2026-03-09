import { google } from "googleapis"
import dotenv from "dotenv"
dotenv.config()

// =============================
// CONFIGURAR AUTENTICACIÓN
// =============================

// Creamos un cliente de autenticación usando
// la cuenta de servicio de Google

const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
)

// Creamos cliente para usar la API de Google Sheets
const sheets = google.sheets({ version: "v4", auth })

// ID del documento de Google Sheets
const spreadsheetId = process.env.GOOGLE_SHEETS_ID


// =============================
// GUARDAR LEAD EN SHEETS
// =============================

export async function saveLead(lead) {

    try {

        // Datos que vamos a guardar en la hoja
        const values = [[
            new Date().toISOString(), // fecha
            lead.nombre,
            lead.telefono,
            lead.localidad
        ]]

        // Insertar fila en la hoja
        await sheets.spreadsheets.values.append({

            spreadsheetId,

            range: "Reclutamiento!A:D", 
            // Nombre de la hoja: Leads
            // Columnas:
            // A = fecha
            // B = nombre
            // C = telefono
            // D = ciudad

            valueInputOption: "USER_ENTERED",

            requestBody: {
                values
            }

        })

        console.log("Lead guardado en Google Sheets")

    } catch (error) {

        console.error("Error guardando lead:", error)

    }

}