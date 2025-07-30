const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post("/recomendar-actividad-criterios", (req, res) => {
const input = req.body;

  // Validar que estén todas las claves necesarias
const keys = [
    "modalidadNombre", "nivelNombre", "gradoNombre", "nombreEspacio",
    "materialCategoria", "complejoNombre", "nombreObjetivo", "duracion"
];

for (const key of keys) {
    if (!input[key]) {
        return res.status(400).json({ error: `Falta el campo ${key}` });
    }
}

  // Ejecutar script python con el input JSON stringificado
const pythonProcess = spawn(
    "python",
    ["./ia/predict_criterios.py", JSON.stringify(input)]
);

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
