from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, bindparam

load_dotenv()

app = FastAPI()

ruta_base = os.path.dirname(__file__)
ruta_modelos = os.path.join(ruta_base, "modelos")

# Carga modelos y vectorizador NLP entrenados
modelo_pred = joblib.load(os.path.join(ruta_modelos, "modelo_prediccion.pkl"))
le_actividad = joblib.load(os.path.join(ruta_modelos, "label_encoder_nombreActividad.pkl"))
modelo_nlp = joblib.load(os.path.join(ruta_modelos, "modelo_nlp.pkl"))
vectorizer_nlp = joblib.load(os.path.join(ruta_modelos, "vectorizer_nlp.pkl"))

# Ajusta campos según etiquetas usadas en entrenamiento
campos_etiquetas = [
    "nivel", "grado", "complejidad", "espacio",
    "materiales", "objetivo", "duracion", "modalidadNombre"
]

# Carga los encoders
encoders = {}
for campo in campos_etiquetas:
    if campo == "duracion":
        continue
    ruta_encoder = os.path.join(ruta_modelos, f"label_encoder_{campo}.pkl")
    encoders[campo] = joblib.load(ruta_encoder)

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "3306"
DB_NAME = os.getenv("DB_NAME")

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

class DatosEstructurados(BaseModel):
    nivel: str
    grado: str
    complejidad: str
    espacio: str
    materiales: str
    objetivo: str
    duracion: int
    modalidadNombre: str

class TextoLibre(BaseModel):
    texto: str


@app.post("/predict")
def predecir_actividad(datos: DatosEstructurados, usar_categoria_desconocida: bool = True):
    print(" Datos recibidos:", datos.dict())
    try:
        X_input = []
        for campo in campos_etiquetas:
            valor = datos.dict()[campo]
            if campo == "duracion":
                valor_codificado = valor
            else:
                le = encoders[campo]
                val_str = str(valor)
                if val_str in le.classes_:
                    valor_codificado = le.transform([val_str])[0]
                else:
                    if usar_categoria_desconocida:
                        valor_codificado = 0
                        print(f"⚠️ Etiqueta desconocida para '{campo}': '{val_str}', usando categoría 0")
                    else:
                        raise HTTPException(status_code=400, detail=f"Etiqueta desconocida para '{campo}': '{val_str}'")
            X_input.append(valor_codificado)

        import pandas as pd
        X_df = pd.DataFrame([X_input], columns=campos_etiquetas)

        # Obtener top 6 actividades por probabilidad
        probas = modelo_pred.predict_proba(X_df)[0]
        top_indices = np.argsort(probas)[::-1][:6]
        actividades_pred = le_actividad.inverse_transform(top_indices)

        actividades_unicas = list(dict.fromkeys(actividades_pred))

        # Consulta SQL (ajusta el nombre de tabla y columnas si cambiaste)
        query = text("""
    SELECT 
        nombreActividad,
        descripcion AS descripcion,
        nivel AS nivel,
        grado AS grado,
        complejidad AS complejidad,
        espacio AS espacio,
        materiales AS materiales,
        objetivo AS objetivo,
        tema AS tema,
        duracion AS duracion,
        modalidadNombre AS modalidadNombre
    FROM ACTIVIDADES_EDUCATIVAS
    WHERE nombreActividad IN :nombres
    GROUP BY nombreActividad, nivel, grado, complejidad, espacio, materiales, objetivo, duracion, tema, descripcion
    ORDER BY nombreActividad
""").bindparams(bindparam("nombres", expanding=True))


        with engine.connect() as conn:
            result = conn.execute(query, {"nombres": actividades_unicas})
            actividades_info = [dict(row._mapping) for row in result]

        print(f"Predicción con info completa (hasta 6): {actividades_info}")
        return {"actividades_sugeridas": actividades_info}

    except HTTPException as he:
        raise he
    except Exception as e:
        print("Error inesperado:", str(e))
        raise HTTPException(status_code=400, detail=f"Error en predicción: {str(e)}")


@app.post("/predict_nlp")
def predecir_actividad_nlp(data: TextoLibre):
    try:
        texto = data.texto.lower()
        X_texto = vectorizer_nlp.transform([texto])
        y_pred_multi = modelo_nlp.predict(X_texto)

        resultados = {}
        for i, campo in enumerate(campos_etiquetas):
            if campo == "duracion":
                valor_codificado = y_pred_multi[0][i]
                try:
                    valor = int(valor_codificado)
                except ValueError:
                    valor = valor_codificado
            else:
                le = encoders[campo]
                valor = le.inverse_transform([y_pred_multi[0][i]])[0]
            resultados[campo] = valor
        
        return resultados
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en predicción NLP: {str(e)}")

@app.get("/")
def raiz():
    return {"mensaje": "Microservicio IA funcionando correctamente"}