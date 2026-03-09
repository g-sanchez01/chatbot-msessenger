import express from "express";
import { handleWebhook, verifyWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Ruta para que Meta verifique el webhook (GET)
router.get("/", verifyWebhook);

// Ruta donde Meta enviará los eventos (POST)
router.post("/", handleWebhook);

export default router;