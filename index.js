import express from 'express'
import dotenv from 'dotenv'
import webhookRoutes from './routes/webhookRoutes.js'

// Firestore
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }

// Cargar variables de entorno desde .env
dotenv.config()

// Inicializar Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
})
export const db = getFirestore()

// Crear la app de Express
const app = express()

// Middleware para parsear JSON
app.use(express.json())

// Usar las rutas del webhook
// Todas las rutas que empiecen con /webhook irán a webhookRoutes
app.use('/webhook', webhookRoutes)

// Puerto definido en .env o por defecto 8080
const PORT = process.env.PORT || 8080

// Arrancar servidor
app.listen(PORT, () => {
    console.log('El servidor se está ejecutando en el puerto:', PORT)
})