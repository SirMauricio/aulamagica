export default function ActividadCard({ actividad }) {
return (
    <div className="actividad-card">
        <h3>{actividad.nombreActividad}</h3>
        <p><strong>Descripción:</strong> {actividad.descripcion}</p>
        <p><strong>Tema:</strong> {actividad.tema}</p>
        <p><strong>Modalidad:</strong> {actividad.modalidadNombre}</p>
        <p><strong>Nivel:</strong> {actividad.nivelNombre}</p>
        <p><strong>Grado:</strong> {actividad.gradoNombre}</p>
        <p><strong>Espacio:</strong> {actividad.nombreEspacio}</p>
        <p><strong>Materiales:</strong> {actividad.materialCategoria}</p>
        <p><strong>Complejidad:</strong> {actividad.complejoNombre}</p>
        <p><strong>Objetivo:</strong> {actividad.nombreObjetivo}</p>
        <p><strong>Duración (min):</strong> {actividad.duracion}</p>
    </div>
    );
}
