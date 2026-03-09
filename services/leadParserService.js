export function parseLead(text) {
    console.log("Parseando...")

    text = text.trim();

  if (field === "nombre") {
    // Si el mensaje tiene "mi nombre es ..." o solo una palabra o frase corta
    const match = text.match(/(?:mi nombre es|nombre|soy|me llamo)?\s*[:\s]*([a-záéíóúñ\s]{2,})/i);
    return match ? match[1].trim() : "";
  }

  if (field === "telefono") {
    // Busca 7 a 15 dígitos, con o sin guiones o espacios
    const match = text.match(/(\d[\d\s-]{6,14}\d)/);
    return match ? match[1].replace(/\s|-/g, "") : "";
  }

  if (field === "ciudad") {
    // Ciudad: palabra o frase, con o sin "vivo en"
    const match = text.match(/(?:ciudad|vivo en|resido en)?\s*[:\s]*([a-záéíóúñ\s]{2,})/i);
    return match ? match[1].trim() : "";
  }

  return "";
}