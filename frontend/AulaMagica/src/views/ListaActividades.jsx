import React from 'react';
import '../viewsEstilos/ListaActividades.css';

export default function ListaActividades({ actividades }) {
    if (!actividades || actividades.length === 0) {
        return <p>No se encontraron actividades.</p>;
    }

    return (
        <div className="lista-actividades">
            {actividades.map((act, i) => (
                <ActividadCard key={i} actividad={act} />
            ))}
        </div>
    );
}

function ActividadCard({ actividad }) {
    return (
        <div className="actividad-card">
            <h3>{actividad.nombreActividad}</h3>
            <div className="actividad-info">
                <p className="descripcion">
                    <strong>Descripción:</strong> {actividad.descripcion}
                </p>
                <p><strong>Tema:</strong> {actividad.tema}</p>
                <p><strong>Modalidad:</strong> {actividad.modalidadNombre}</p>
                <p><strong>Nivel:</strong> {actividad.nivel}</p>
                <p><strong>Grado:</strong> {actividad.grado}</p>
                <p><strong>Espacio:</strong> {actividad.espacio}</p>
                <p><strong>Materiales:</strong> {actividad.materiales}</p>
                <p><strong>Objetivo:</strong> {actividad.objetivo}</p>
                <p><strong>Duración (min):</strong> {actividad.duracion}</p>
            </div>
        </div>
    );
}
