export default function ListaActividades({ actividades }) {
if (!actividades || actividades.length === 0) {
    return <p>No se encontraron actividades.</p>;
}

return (
    <div className="lista-actividades">
    {actividades.map((act, i) => (
        <div
            key={i}
            className="actividad-card"
            style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}
        >
            <h3>{act.nombreActividad}</h3>
            <p><strong>Descripción:</strong> {act.descripcion}</p>
            <p><strong>Tema:</strong> {act.tema}</p>
            <p><strong>Nivel:</strong> {act.nivel}</p>
            <p><strong>Grado:</strong> {act.grado}</p>
            <p><strong>Espacio:</strong> {act.espacio}</p>
            <p><strong>Materiales:</strong> {act.materiales}</p>
            <p><strong>Objetivo:</strong> {act.objetivo}</p>
            <p><strong>Duración en minutos:</strong> {act.duracion}</p>
        </div>
        ))}
    </div>
    );
}

