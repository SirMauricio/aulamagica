import React, { useState } from "react";
import axios from "axios";
import "../viewsEstilos/Formulario.css";

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
        alert("Por favor, ingresa texto.");
        return;
    }
    try {
        const res = await axios.post("/api/recomendar-actividad", { texto: textoLibre });
        setResultadoNLP(res.data);
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al consultar NLP.");
    }
    };

const consultarCriterios = async (e) => {
    e.preventDefault();

    for (const campo of campos) {
        if (!criterios[campo]) {
        alert(`Falta completar el campo: ${campo}`);
        return;
    }
    }

    try {
        const res = await axios.post("/api/recomendar-actividad-criterios", criterios);
        setResultadoCriterios(res.data);
    } catch (error) {
        console.error(error);
        alert("Error al consultar por criterios.");
    }
};

return (
    <div className="formulario-container">
        <section className="section">
        <h2 className="section-title">Recomendación por Texto Libre (IA)</h2>
        <textarea
            className="textarea"
            value={textoLibre}
            onChange={(e) => setTextoLibre(e.target.value)}
            placeholder="Describe una situación o necesidad educativa..."
            aria-label="Texto libre"
        />
        <button className="btn" onClick={consultarNLP}>Consultar con IA</button>

        {resultadoNLP && (
            <div className="result">
            <h3>Resultado:</h3>
            <pre>{JSON.stringify(resultadoNLP, null, 2)}</pre>
            </div>
        )}
        </section>

        <hr className="divider" />

        <section className="section">
        <h2 className="section-title">Recomendación por Criterios Manuales</h2>
        <form className="form" onSubmit={consultarCriterios}>
            {campos.map((campo) => (
            <div className="form-group" key={campo}>
                <label htmlFor={campo} className="label">{campo}:</label>
                <input
                type="text"
                id={campo}
                name={campo}
                value={criterios[campo]}
                onChange={manejarCambioCriterio}
                className="input"
                required
                />
            </div>
            ))}
            <button type="submit" className="btn">Consultar por Criterios</button>
        </form>

        {resultadoCriterios && (
            <div className="result">
            <h3>Actividad Recomendada:</h3>
            <p>{resultadoCriterios.actividad_predicha}</p>
            </div>
        )}
        </section>
    </div>
    );
}
