const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post("/recomendar-actividad", (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ error: "Falta texto de entrada" });
    }

  // Ejecutar script python con el texto
const pythonProcess = spawn("python", ["./ia/predict.py", texto]);

let dataString = "";
pythonProcess.stdout.on("data", (data) => {
    dataString += data.toString();
});

pythonProcess.stderr.on("data", (data) => {
    console.error(`Error python: ${data}`);
});

pythonProcess.on("close", (code) => {
    if (code !== 0) {
        return res.status(500).json({ error: "Error en predicción" });
    }

    try {
        const resultado = JSON.parse(dataString);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Error procesando respuesta" });
    }
    });
});

module.exports = router;
