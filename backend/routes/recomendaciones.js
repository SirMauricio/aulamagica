const express = require('express');
const router = express.Router();
const { consultarModeloIA } = require('../services/modeloIA');

router.post('/recomendar-actividad-criterios', async (req, res) => {
try {
    const datos = req.body; // Aquí recibes los criterios desde el frontend
    const resultado = await consultarModeloIA(datos);
    res.json(resultado);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener recomendación de IA' });
}
});

module.exports = router;
