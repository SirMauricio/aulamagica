const express = require("express");
const loginControllers = require("../Controllers/loginControllers");
const router = express.Router();

router.post("/", loginControllers.Login);
router.post("/confirmar", loginControllers.confirmarLogin);

module.exports = router