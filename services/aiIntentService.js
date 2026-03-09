import fetch from "node-fetch"

// Esta función analiza el mensaje y devuelve
// si el usuario está interesado o solo quiere información

export async function detectIntent(message) {

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
Clasifica la intención del usuario.

Responde SOLO una palabra:

INFO
INTERESADO

INTERESADO = quiere contratar, aplicar, registrarse o saber cómo empezar.

INFO = solo quiere información.
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

    return data.choices[0].message.content.trim()
}