import React, { useState, useEffect } from "react";
import axios from "axios";
import "../viewsEstilos/Formulario.css";

const campos = [
    { name: "modalidadNombre", label: "Modalidad", endpoint: "/api/modalidades" },
    { name: "nivelNombre", label: "Nivel", endpoint: "/api/nivel" },
    { name: "gradoNombre", label: "Grado", endpoint: "/api/grado" },
    { name: "nombreEspacio", label: "Espacio Educativo", endpoint: "/api/espacio" },
    { name: "materialCategoria", label: "Categoría de Material", endpoint: "/api/materiales" },
    { name: "complejoNombre", label: "Complejo", endpoint: "/api/complejidades" },
    { name: "nombreObjetivo", label: "Objetivo", endpoint: "/api/objetivos" },
    { name: "duracion", label: "Duración (horas)", endpoint: "/api/duracion" },
];

export default function Formulario() {
    const [textoLibre, setTextoLibre] = useState("");
    const [resultadoNLP, setResultadoNLP] = useState(null);
    const [criterios, setCriterios] = useState(
    campos.reduce((acc, campo) => ({ ...acc, [campo.name]: "" }), {})
);
const [opciones, setOpciones] = useState(
    campos.reduce((acc, campo) => ({ ...acc, [campo.name]: [] }), {})
);
const [resultadoCriterios, setResultadoCriterios] = useState(null);

useEffect(() => {
    campos.forEach(({ name, endpoint }) => {
        axios
        .get(endpoint)
        .then((res) => {
            setOpciones((prev) => ({ ...prev, [name]: res.data }));
        })
        .catch((error) => {
            console.error(`Error cargando opciones para ${name}:`, error);
        });
    });
}, []);

const manejarCambioCriterio = (e) => {
    const { name, value } = e.target;
    setCriterios((prev) => ({ ...prev, [name]: value }));
};

const consultarCriterios = async (e) => {
    e.preventDefault();

    for (const campo of campos) {
        if (!criterios[campo.name]) {
        alert(`Falta completar el campo: ${campo.label}`);
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

return (
    <div className="formulario-container">
        <section className="section">
        <h2 className="section-title">Recomendación por Criterios Manuales</h2>
        <form className="form" onSubmit={consultarCriterios}>
            {campos.map(({ name, label }) => (
            <div className="form-group" key={name}>
                <label htmlFor={name} className="label">
                {label}:
                </label>
                <select
                id={name}
                name={name}
                value={criterios[name]}
                onChange={manejarCambioCriterio}
                className="input"
                required
                >
                <option value="">-- Seleccione --</option>
                {opciones[name].map((opcion, i) => {
                  // Ajusta según estructura real de la respuesta del backend
                    const valor = opcion.nombre || opcion.label || opcion.id || opcion;
                    return (
                    <option key={i} value={valor}>
                        {valor}
                    </option>
                    );
                })}
                </select>
            </div>
            ))}
            <button type="submit" className="btn">
            Consultar por Criterios
            </button>
        </form>

        {resultadoCriterios && (
            <div className="result" style={{ marginTop: "1rem" }}>
                <h3>Actividad Recomendada:</h3>
            <p>{resultadoCriterios.actividad_predicha}</p>
            </div>
        )}
        </section>

        <hr className="divider" />

        <section className="section">
        <h2 className="section-title">Recomendación por Texto Libre (IA)</h2>
        <textarea
            className="textarea"
            value={textoLibre}
            onChange={(e) => setTextoLibre(e.target.value)}
            placeholder="Describe una situación o necesidad educativa..."
            aria-label="Texto libre"
        />
        <button className="btn" onClick={consultarNLP}>
            Consultar con IA
        </button>

        {resultadoNLP && (
            <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Resultado:</h3>
            <pre>{JSON.stringify(resultadoNLP, null, 2)}</pre>
            </div>
        )}
        </section>
    </div>
    );
}
