const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/predict", async (req, res) => {
try {
    const response = await axios.post("http://localhost:8001/predict", req.body);
    res.json(response.data);
} catch (error) {
    console.error("Error al llamar microservicio predict:", error.message);
    res.status(500).json({ error: "Error en predicción" });
}
});

router.post("/predict_nlp", async (req, res) => {
try {
    const response = await axios.post("http://localhost:8001/predict_nlp", req.body);
    res.json(response.data);
} catch (error) {
    console.error("Error al llamar microservicio predict_nlp:", error.message);
    res.status(500).json({ error: "Error en predicción NLP" });
}
});

module.exports = router;
