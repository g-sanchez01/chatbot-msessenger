import fetch from "node-fetch"

// Genera una respuesta informativa usando IA
export async function generateInfo(message) {

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
Eres un asistente de ventas.

Explica brevemente los servicios de la empresa.
Invita al usuario a registrarse si está interesado.
`
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    })

    const data = await response.json()

    return data.choices[0].message.content
} 