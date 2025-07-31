const express = require('express');
const router = express.Router();
const formularioController = require('../Controllers/formularioControllers');

// Ruta para crear nuevo formulario
router.post('/', formularioController.crearFormulario);

// Ruta para obtener todos los formularios
router.get('/', formularioController.obtenerFormularios);

module.exports = router;
