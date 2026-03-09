export function parseLead(text) {
    console.log("Parseando...")
    const data = {};
    const regexNombre = /Nombre:\s*([^,]+)/i;
    const regexTel = /Tel(?:éfono)?:\s*(\d+)/i;
    const regexCiudad = /Ciudad:\s*([^,]+)/i;

    const nombre = text.match(regexNombre);
    const telefono = text.match(regexTel);
    const ciudad = text.match(regexCiudad);

    data.nombre = nombre ? nombre[1].trim() : "";
    data.telefono = telefono ? telefono[1].trim() : "";
    data.ciudad = ciudad ? ciudad[1].trim() : "";

    return data;
}