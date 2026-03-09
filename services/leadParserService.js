export function parseField(text, field) {
    text = text.toLowerCase();

    if (field === "nombre") {
        const match = text.match(/(?:mi nombre es|nombre|soy)\s*[:\s]*([a-záéíóúA-ZÁÉÍÓÚ\s]+)/i);
        return match ? match[1].trim() : "";
    }

    if (field === "telefono") {
        const match = text.match(/(?:tel(?:éfono)?|celular)\s*[:\s]*(\d{7,15})/i);
        return match ? match[1].trim() : "";
    }

    if (field === "ciudad") {
        const match = text.match(/(?:ciudad|vivo en|resido en)\s*[:\s]*([a-z\s]+)/i);
        return match ? match[1].trim() : "";
    }

    return "";
}