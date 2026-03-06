export const extractData = (message) => {

    const text = message.trim()
    const lower = text.toLowerCase()

    let nombre = null
    let telefono = null
    let localidad = null

    // detectar telefono
    const phoneMatch = text.match(/\b\d{10}\b/)
    if (phoneMatch) {
        telefono = phoneMatch[0]
    }

    // posible nombre
    if (!telefono && text.length < 40 && !/\d/.test(text)) {
        nombre = text
    }

    // ciudades conocidas
    const ciudades = [
        "monterrey",
        "apodaca",
        "guadalupe",
        "escobedo",
        "san nicolas"
    ]

    for (const ciudad of ciudades) {
        if (lower.includes(ciudad)) {
            localidad = ciudad
            break
        }
    }

    return {
        nombre,
        telefono,
        localidad
    }
}