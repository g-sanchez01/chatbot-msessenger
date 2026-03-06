import express from "express"
import { handleWebhook } from "../controllers/webhookController.js"

const router = express.Router()

// Verificación del webhook
router.get("/", handleWebhook)

// Recepción de eventos
router.post("/", handleWebhook)

export default router