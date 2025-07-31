
const express = require("express");
const router = express.Router();
const pool = require("../database"); 

router.get("/", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT duracion FROM DURACION"); 
    res.json(rows.map(r => r.duracion));
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener Duraciones" });
}
});

module.exports = router;
