
const express = require("express");
const router = express.Router();
const pool = require("../database");

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT gradoNombre FROM GRADO_EDUCATIVO"); 
    res.json(rows.map(r => r.gradoNombre));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener grados" });
}
});

module.exports = router;
