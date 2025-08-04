import React, { useState, useEffect } from "react";
import axios from "axios";
import '../viewsEstilos/Formulario.css';
import ListaActividades from "./ListaActividades";


const campos = [
{ name: "modalidadNombre", label: "Modalidad", endpoint: "/api/modalidades" },
{ name: "nivel", label: "Nivel", endpoint: "/api/nivel" },
{ name: "grado", label: "Grado", endpoint: "/api/grado" },
{ name: "complejidad",  label: "Complejo", endpoint: "/api/complejidades" },
{ name: "espacio",label: "Espacio Educativo", endpoint: "/api/espacio" },
{ name: "materiales", label: "Categoría de Material", endpoint: "/api/materiales" },
{ name: "objetivo", label: "Objetivo", endpoint: "/api/objetivos" },
{ name: "duracion", label: "Duración (minutos)", endpoint: "/api/duracion" },
];

export default function FormularioIA() {
const [criterios, setCriterios] = useState(
    campos.reduce((acc, campo) => ({ ...acc, [campo.name]: "" }), {})
);
const [opciones, setOpciones] = useState(
    campos.reduce((acc, campo) => ({ ...acc, [campo.name]: [] }), {})
);
const [resultadoCriterios, setResultadoCriterios] = useState([]);


const [textoLibre, setTextoLibre] = useState("");
const [resultadoNLP, setResultadoNLP] = useState(null);

  // Cargar opciones para selects al cargar el componente
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

  // Manejar cambios en selects
const manejarCambioCriterio = (e) => {
    const { name, value } = e.target;
    setCriterios((prev) => ({ ...prev, [name]: value }));
};

  // Llamar backend para modelo estructurado
const consultarCriterios = async (e) => {
    e.preventDefault();
    for (const campo of campos) {
        if (!criterios[campo.name]) {
            alert(`Por favor completa: ${campo.label}`);
            return;
        }
    }

    // Trnasformamos el dato de "duracion" a número
    const datosTransformados = {
        ...criterios,
        duracion: parseInt(criterios.duracion, 10),
    };

    console.log(" Enviando datos al backend:", datosTransformados); 

try {
    const res = await axios.post("http://localhost:5000/api/ia/predict", datosTransformados);
    setResultadoCriterios(res.data.actividades_sugeridas || []);
} catch (error) {
    alert("Error al consultar actividad por criterios.");
}

};

  // Llamar backend para modelo NLP
    const consultarNLP = async () => {
    if (!textoLibre.trim()) {
        alert("Por favor escribe texto para consultar NLP.");
        return;
    }
    try {
        const res = await axios.post("http://localhost:5000/api/ia/predict_nlp", { texto: textoLibre });
        setResultadoNLP(res.data);
    } catch (error) {
        alert("Error al consultar actividad con NLP.");
    }
    };

    return (
    <div className="formulario-container">
        <section className="section">
        <h2 className="section-title">Recomendación por Criterios Manuales</h2>
        <form className="form" onSubmit={consultarCriterios}>
            {campos.map(({ name, label }) => (
            <div className="form-group" key={name}>
                <label htmlFor={name} className="label">{label}:</label>
                <select
                id={name}
                name={name}
                value={criterios[name]}
                onChange={manejarCambioCriterio}
                className="input"
                required
                >
                <option value="">-- Seleccione --</option>
                {opciones[name]
                    .filter((opcion) => opcion !== null && opcion !== undefined)
                    .map((opcion, i) => {
                    const valor = typeof opcion === "object" ? opcion.nombre || opcion.label || opcion.id : opcion;
                    return (
                        <option key={i} value={valor}>
                        {valor}
                        </option>
                    );
                    })}
                </select>
            </div>
            ))}
            <button type="submit" className="btn">Consultar por Criterios</button>
        </form>

        {resultadoCriterios.length > 0 && (
    <section style={{ marginTop: "1rem" }}>
    <h3>Actividades recomendadas:</h3>
    <ListaActividades actividades={resultadoCriterios} />
    </section>
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
        <button className="btn" onClick={consultarNLP}>Consultar con IA</button>

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
