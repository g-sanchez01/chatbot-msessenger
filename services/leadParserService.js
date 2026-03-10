export function parseLead(text, field) {
    console.log("Parseando...", field);

    text = text.trim();

    if (field === "nombre") {
        // Si el mensaje tiene "mi nombre es ..." o solo una palabra o frase corta
        const match = text.match(/(?:mi nombre es|nombre|soy|me llamo)?\s*[:\s]*([a-záéíóúñ\s]{2,})/i);
        return match ? match[1].trim() : "";
    }

    return "";
}