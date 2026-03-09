/* Esta función analiza el mensaje del usuario e intenta detectar nombre, teléfono o ciudad */
export const extractData = (message) => {

    const text = message.trim()
    const lower = text.toLowerCase()

    let nombre = null
    let telefono = null
    let localidad = null

    // Buscar Telefono (10 numero seguidos)
    const phoneMatch = text.match(/\b\d{10}\b/)
    if (phoneMatch) telefono = phoneMatch[0]

    // Si el texto es corto y no tiene numeros porbablemente sera el nombre
    if (!telefono && text.length < 40 && !/\d/.test(text)) {
        nombre = text
    }

    // Lista de ciudades conocidas
    const ciudades = ["monterrey","apodaca","guadalupe","escobedo","san nicolas"]

    for (const ciudad of ciudades) {
        if (lower.includes(ciudad)) {
            localidad = ciudad
            break
        }
    }

    return { nombre, telefono, localidad }
}