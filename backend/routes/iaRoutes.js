const express = require('express');
const router = express.Router();
const iaController = require('../Controllers/iaControllers');

router.post('/sugerencias', iaController.sugerirActividades);

module.exports = router;
