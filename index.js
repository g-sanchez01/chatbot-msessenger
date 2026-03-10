import express from 'express'
import dotenv from 'dotenv'
import webhookRoutes from './routes/webhookRoutes.js'
// Cargar variables de entorno desde .env
dotenv.config()

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