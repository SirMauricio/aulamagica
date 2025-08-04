import '../viewsEstilos/ActividadCard.css';

export default function ActividadCard({ actividad }) {
    return (
        <div className="actividad-card">
            <h3>{actividad.nombreActividad}</h3>
            <div className="descripcion">
                <strong>Descripción:</strong> {actividad.descripcion}
            </div>
            <p><strong>Tema:</strong> {actividad.tema}</p>
            <p><strong>Modalidad:</strong> {actividad.modalidadNombre}</p>
            <p><strong>Nivel:</strong> {actividad.nivel || actividad.nivelNombre}</p>
            <p><strong>Grado:</strong> {actividad.grado || actividad.gradoNombre}</p>
            <p><strong>Espacio:</strong> {actividad.espacio || actividad.nombreEspacio}</p>
            <p><strong>Materiales:</strong> {actividad.materiales || actividad.materialCategoria}</p>
            <p><strong>Complejidad:</strong> {actividad.complejo || actividad.complejoNombre}</p>
            <p><strong>Objetivo:</strong> {actividad.objetivo || actividad.nombreObjetivo}</p>
            <p><strong>Duración (min):</strong> {actividad.duracion}</p>
        </div>
    );
}
