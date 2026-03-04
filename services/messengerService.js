import axios from "axios";

export const sendMessage = async (psid, text) => {
    try {
        const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

        const response = await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: psid },
                message: { text }
            }
        );

        console.log("Mensaje enviado:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error en sendMessage:", error.response?.data || error.message);
        throw error;
    }
};