const express = require("express");
const axios = require("axios");
const router = express.Router();

const FASTAPI_URL = "http://localhost:8001";

router.post("/predict", async (req, res) => {
console.log("➡️ Datos recibidos en Node /predict:", req.body);
try {
    const response = await axios.post(`${FASTAPI_URL}/predict`, req.body);
    console.log("⬅️ Respuesta de FastAPI /predict:", response.data);
    res.json(response.data);
} catch (error) {
    console.error("Error al llamar microservicio predict:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en predicción" });
}
});

router.post("/predict_nlp", async (req, res) => {
console.log("➡️ Datos recibidos en Node /predict_nlp:", req.body);
try {
    const response = await axios.post(`${FASTAPI_URL}/predict_nlp`, req.body);
    console.log("⬅️ Respuesta de FastAPI /predict_nlp:", response.data);
    res.json(response.data);
} catch (error) {
    console.error("Error al llamar microservicio predict_nlp:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en predicción NLP" });
}
});

module.exports = router;
