import express from 'express'
import dotenv from 'dotenv'
import webhookRoutes from './routes/webhookRoutes.js'

dotenv.config()

// Configurar aplicación
const app = express()

app.use(express.json())

// Usar rutas
app.use('/webhook', webhookRoutes)

// Definir puerto
const PORT = process.env.PORT

// Arrancar app
app.listen(PORT, () => {
    console.log('El servidor se esta ejecutando en el puerto:', PORT)
})