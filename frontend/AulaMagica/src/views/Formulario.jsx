import React, { useState } from "react";
import axios from "axios";
import "../viewsEstilos/Formulario.css"; // Ajusta la ruta según tu estructura

const campos = [
    "modalidadNombre",
    "nivelNombre",
    "gradoNombre",
    "nombreEspacio",
    "materialCategoria",
    "complejoNombre",
    "nombreObjetivo",
    "duracion",
];

export default function Formulario() {
    const [textoLibre, setTextoLibre] = useState("");
    const [resultadoNLP, setResultadoNLP] = useState(null);
    const [criterios, setCriterios] = useState(
    campos.reduce((acc, campo) => ({ ...acc, [campo]: "" }), {})
);
const [resultadoCriterios, setResultadoCriterios] = useState(null);

const manejarCambioCriterio = (e) => {
    const { name, value } = e.target;
    setCriterios((prev) => ({ ...prev, [name]: value }));
};

const consultarNLP = async () => {
    if (!textoLibre.trim()) {
        alert("Ingresa texto libre");
        return;
    }
    try {
        const res = await axios.post("/api/recomendar-actividad", { texto: textoLibre });
        setResultadoNLP(res.data);
    } catch (error) {
        console.error(error);
        alert("Error al consultar modelo NLP");
    }
};

const consultarCriterios = async (e) => {
    e.preventDefault();

    for (const campo of campos) {
        if (!criterios[campo]) {
        alert(`Completa el campo ${campo}`);
        return;
        }
    }

    try {
        const res = await axios.post("/api/recomendar-actividad-criterios", criterios);
        setResultadoCriterios(res.data);
    } catch (error) {
        console.error(error);
        alert("Error al consultar modelo por criterios");
    }
    };

return (
    <div className="container">
        <h2>Recomendación con texto libre (NLP)</h2>
        <textarea
        className="textareaInput"
        value={textoLibre}
        onChange={(e) => setTextoLibre(e.target.value)}
        placeholder="Escribe tu texto aquí"
        />
        <button className="button" onClick={consultarNLP}>Consultar NLP</button>

        {resultadoNLP && (
        <div className="resultBox">
            <h3>Resultados NLP:</h3>
            <pre>{JSON.stringify(resultadoNLP, null, 2)}</pre>
        </div>
        )}

        <hr className="hrSeparator" />

        <h2>Recomendación por criterios seleccionados</h2>
        <form onSubmit={consultarCriterios}>
        {campos.map((campo) => (
            <div className="formGroup" key={campo}>
            <label className="label" htmlFor={campo}>{campo}:</label>
            <input
                className="inputText"
                type="text"
                id={campo}
                name={campo}
                value={criterios[campo]}
                onChange={manejarCambioCriterio}
                required
            />
            </div>
        ))}
        <button className="button" type="submit">Consultar criterios</button>
        </form>

        {resultadoCriterios && (
        <div style={{ marginTop: 20 }}>
            <h3>Actividad recomendada:</h3>
            <p>{resultadoCriterios.actividad_predicha}</p>
        </div>
        )}
    </div>
    );
}
