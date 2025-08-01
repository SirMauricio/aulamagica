// ListaActividades.jsx
export default function ListaActividades({ actividades }) {
if (!actividades || actividades.length === 0) {
    return <p>No se encontraron actividades.</p>;
}

return (
    <div className="lista-actividades">
        {actividades.map((act, i) => (
        <div key={i} className="actividad-card" style={{border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem"}}>
            <h3>{act.nombreActividad}</h3>
            <p><strong>Descripción:</strong> {act.descripcion}</p>
            <p><strong>Tema:</strong> {act.tema}</p>
            <p><strong>Modalidad:</strong> {act.modalidadNombre}</p>
            <p><strong>Nivel:</strong> {act.nivelNombre}</p>
            <p><strong>Grado:</strong> {act.gradoNombre}</p>
            <p><strong>Espacio:</strong> {act.nombreEspacio}</p>
            <p><strong>Materiales:</strong> {act.materialCategoria}</p>
            <p><strong>Complejidad:</strong> {act.complejoNombre}</p>
            <p><strong>Objetivo:</strong> {act.nombreObjetivo}</p>
            <p><strong>Duración (minutos):</strong> {act.duracion}</p>
        </div>
        ))}
    </div>
    );
}
