export function parseLead(text) {
    console.log("Parseando...")

    text = text.toLowerCase();

    // Nombre: permite acentos y varias palabras
    const nombreMatch = text.match(/(?:mi nombre es|nombre|soy|me llamo)\s*[:\s]*([a-záéíóúñ\s]+)/i);
    // Teléfono: permite números, guiones o espacios
    const telefonoMatch = text.match(/(?:tel(?:éfono)?|celular)\s*[:\s]*([\d\s-]{7,15})/i);
    // Ciudad: permite varias palabras y acentos
    const ciudadMatch = text.match(/(?:ciudad|vivo en|resido en)\s*[:\s]*([a-záéíóúñ\s]+)/i);


    return {
        nombre: nombreMatch ? nombreMatch[1].trim() : "",
        telefono: telefonoMatch ? telefonoMatch[1].replace(/\s|-/g, "") : "",
        ciudad: ciudadMatch ? ciudadMatch[1].trim() : "",
    }
}