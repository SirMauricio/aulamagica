
const express = require("express");
const router = express.Router();
const pool = require("../database"); 

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT nombreObjetivo FROM OBJETIVO"); 
    res.json(rows.map(r => r.nombreObjetivo));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener Objetivos" });
}
});

module.exports = router;
