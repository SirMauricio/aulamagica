const { ejecutarIA } = require('../services/iaService');

exports.sugerirActividades = async (req, res) => {
const datosEntrada = req.body;

try {
    const resultado = await ejecutarIA(datosEntrada);
    res.status(200).json({ sugerencias: resultado });
} catch (error) {
    res.status(500).json({ error: 'Error al generar sugerencias con IA.' });
}
};
