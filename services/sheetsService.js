import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_KEY_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function saveLeadToSheets(lead) {

  try {

    const values = [[
      lead.psid || "",
      lead.nombre || "",
      lead.telefono || "",
      lead.localidad || ""
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Reclutamiento!A:D",
      valueInputOption: "RAW",
      resource: {
        values
      }
    });

    console.log("Lead guardado en Sheets:", values);

  } catch (error) {
    console.error("Error guardando lead:", error);
  }

}