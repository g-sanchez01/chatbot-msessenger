import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // carga PAGE_TOKEN desde .env

const PAGE_TOKEN = process.env.PAGE_TOKEN;

// Reemplaza con el PSID de tu cuenta de prueba
const PSID = "1234567890123456"; 
const MESSAGE = "¡Hola! Esto es una prueba desde Node.js 🛠️";

const sendMessage = async (psid, text) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
            {
                recipient: { id: psid },
                message: { text }
            }
        );
        console.log("Mensaje enviado:", response.data);
    } catch (error) {
        console.error("Error al enviar mensaje:", error.response?.data || error.message);
    }
};

// Llamada de prueba
sendMessage(PSID, MESSAGE);