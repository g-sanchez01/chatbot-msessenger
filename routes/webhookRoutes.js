import express from "express"
import { handleWebhook } from '../controllers/webhookController.js'

const router = express.Router()

// Verificación del webhook (GET)
router.get("/", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN

    const mode = req.query["hub.mode"]
    const token = req.query["hub.verify_token"]
    const challenge = req.query["hub.challenge"]

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verificado correctamente")
        return res.status(200).send(challenge)
    } else {
        return res.sendStatus(403)
    }
})

// Recepcion de mensajes (POST)
router.post('/', handleWebhook)

export default router;