const express = require("express");
const usuariosControllers = require("../Controllers/adminControllers"); 
const router = express.Router();

router.get("/usuarios", usuariosControllers.verUsuarios);
router.post("/usuarios", usuariosControllers.crearUsuario);
router.put("/usuarios/:id_usuario", usuariosControllers.editarUsuario);
router.delete("/usuarios/:id_usuario", usuariosControllers.eliminarUsuario);

module.exports = router;
