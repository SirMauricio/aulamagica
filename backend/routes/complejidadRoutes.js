const express = require("express");
const router = express.Router();
const pool = require("../database");

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT complejoNombre FROM COMPLEJIDAD"); 
    res.json(rows.map(r => r.complejoNombre));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener Complejidad" });
}
});

module.exports = router;
