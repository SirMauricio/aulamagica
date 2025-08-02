export default function ActividadCard({ actividad }) {
return (
    <div className="actividad-card">
        <h3>{actividad.nombreActividad}</h3>
        <p><strong>Descripción:</strong> {actividad.descripcion}</p>
        <p><strong>Tema:</strong> {actividad.tema}</p>
        <p><strong>Nivel:</strong> {actividad.nivel}</p>
        <p><strong>Grado:</strong> {actividad.grado}</p>
        <p><strong>Espacio:</strong> {actividad.espacio}</p>
        <p><strong>Materiales:</strong> {actividad.materiales}</p>
        <p><strong>Objetivo:</strong> {actividad.objetivo}</p>
        <p><strong>Duración:</strong> {actividad.duracion}</p>
    </div>
    );
}
