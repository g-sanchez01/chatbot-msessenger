import { google } from "googleapis"
import fs from "fs"

const creds = JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: creds, // usamos la variable de entorno directamente
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth })

const SPREADSHEET_ID = process.env.SPREADSHEET_ID

export const saveVariable = async (psid, key, value) => {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "talentos",
      valueInputOption: "RAW",
      requestBody: {
        values: [[psid, key, value]],
      },
    })

    console.log("Guardado correctamente en Sheets")
  } catch (error) {
    console.error("Error guardando en Sheets:", error.response?.data || error)
  }
}