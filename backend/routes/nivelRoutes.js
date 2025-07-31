// rutas/modalidades.js
const express = require("express");
const router = express.Router();
const pool = require("../database"); 

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT nivelNombre FROM NIVEL_ACADEMICO");
    res.json(rows.map(r => r.nivelNombre));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener nivel educativo" });
}
});

module.exports = router;
