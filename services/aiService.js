import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAIKEY

if (!apiKey) {
    throw new Error("❌ La variable de entorno OPENAIKEY no está definida. Revisa tu archivo .env");
}

const openai = new OpenAI({
    apiKey: apiKey
});

export const askAI = async (message) => {
    const prompt = message.replace("ia:", "").trim();

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres asistente profesional." },
                { role: "user", content: prompt }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error al comunicarse con OpenAI:", error.message);
        return "Lo siento, hubo un problema al procesar tu solicitud.";
    }
};