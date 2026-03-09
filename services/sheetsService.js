import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function saveLeadToSheets(lead) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Reclutamiento!A:D",
      valueInputOption: "RAW",
      resource: {
        values: [[lead.nombre, lead.telefono, lead.ciudad, lead.timestamp]],
      },
    });
    console.log("Lead guardado:", lead);
  } catch (error) {
    console.error("Error guardando lead:", error);
  }
}