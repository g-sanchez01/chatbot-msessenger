import fetch from "node-fetch"

// Esta función envía mensajes al usuario en Messenger
export async function sendMessage(psid, text) {

    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            recipient: { id: psid },
            message: { text }
        })
    })

}