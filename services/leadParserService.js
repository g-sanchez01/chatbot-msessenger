// Validaciones para cada tipo de dato
export function parseField(text, field) {
  text = text.trim();

  if (field === "nombre") {
    return isValidNombre(text) ? text : "";
  }

  if (field === "telefono") {
    return isValidTelefono(text) ? text.replace(/\s|-/g, "") : "";
  }

  if (field === "ciudad") {
    return isValidCiudad(text) ? text : "";
  }

  return "";
}

// Validación de nombre: letras y espacios, al menos 2 caracteres
function isValidNombre(text) {
  return /^[a-zA-Záéíóúñ\s]{2,}$/.test(text);
}

// Validación de teléfono: 7 a 15 dígitos
function isValidTelefono(text) {
  return /^\d{7,15}$/.test(text.replace(/\s|-/g, ""));
}

// Validación de ciudad: letras y espacios, al menos 2 caracteres
function isValidCiudad(text) {
  return /^[a-zA-Záéíóúñ\s]{2,}$/.test(text);
}