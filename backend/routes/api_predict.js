const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/predecir', async (req, res) => {
try {
    const { texto, criterios } = req.body;

    if (!texto && (!criterios || Object.keys(criterios).length === 0)) {
        return res.status(400).json({ error: 'Se requiere texto o criterios para la predicción' });
    }

    const datos = {
        texto: texto || '',
        criterios: criterios || {}
    };

    const respuesta = await axios.post('http://localhost:8001/api/modelos/combinados', datos);

    return res.json(respuesta.data);

} catch (error) {
    console.error('Error en API /predecir:', error.message);
    res.status(500).json({ error: 'Error interno al predecir' });
}
});

module.exports = router;
