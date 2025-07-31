const express = require("express");
const router = express.Router();
const pool = require("../database");

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT materialCategoria FROM USO_MATERIALES"); 
    res.json(rows.map(r => r.usoMateriales));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener Uso de Materiales" });
}
});

module.exports = router;
