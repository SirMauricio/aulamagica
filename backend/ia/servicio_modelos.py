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

modelo_pred = joblib.load(os.path.join(ruta_modelos, "modelo_prediccion.pkl"))
le_actividad = joblib.load(os.path.join(ruta_modelos, "label_encoder_nombreActividad.pkl"))

campos_etiquetas = [
    "modalidadNombre", "nivelNombre", "gradoNombre",
    "nombreEspacio", "materialCategoria", "complejoNombre",
    "nombreObjetivo", "duracion"
]

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
    modalidadNombre: str
    nivelNombre: str
    gradoNombre: str
    nombreEspacio: str
    materialCategoria: str
    complejoNombre: str
    nombreObjetivo: str
    duracion: int

@app.post("/predict")
def predecir_actividad(datos: DatosEstructurados, usar_categoria_desconocida: bool = True):
    print("📥 Datos recibidos:", datos.dict())
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
                        valor_codificado = 0  # índice para categoría "desconocida"
                        print(f"⚠️ Etiqueta desconocida para '{campo}': '{val_str}', usando categoría 0")
                    else:
                        raise HTTPException(status_code=400, detail=f"Etiqueta desconocida para '{campo}': '{val_str}'")
            X_input.append(valor_codificado)

        import pandas as pd
        # Convertir a DataFrame con columnas para evitar warning
        X_df = pd.DataFrame([X_input], columns=campos_etiquetas)
        y_pred = modelo_pred.predict(X_df)
        actividades_pred = le_actividad.inverse_transform(y_pred)

        placeholders = ",".join(["%s"] * len(actividades_pred))
        query = text(f"""
            SELECT A.nombreActividad, A.tema, A.descripcion, 
            M.modalidadNombre, N.nivelNombre, G.gradoNombre, 
            E.nombreEspacio, MAT.materialCategoria, COM.complejoNombre,
            OB.nombreObjetivo, DU.duracion
            FROM ACTIVIDADES A
            LEFT JOIN ACTIVIDAD_MODALIDAD AM ON A.actId = AM.actId
            LEFT JOIN MODALIDADES M ON AM.modId = M.modId
            LEFT JOIN ACTIVIDAD_NIVEL_GRADO ANG ON A.actId = ANG.actId
            LEFT JOIN NIVEL_EDUCATIVO N ON ANG.nivelId = N.nivelId
            LEFT JOIN GRADO_EDUCATIVO G ON ANG.gradoId = G.gradoId
            LEFT JOIN ACTIVIDAD_ESPACIO AE ON A.actId = AE.actId
            LEFT JOIN ESPACIO E ON AE.espacioId = E.espacioId
            LEFT JOIN ACTIVIDAD_MATERIALES AMAT ON A.actId = AMAT.actId
            LEFT JOIN USO_MATERIALES MAT ON AMAT.materialId = MAT.materialId
            LEFT JOIN ACTIVIDAD_COMPLEJIDAD ACOM ON A.actId = ACOM.actId
            LEFT JOIN COMPLEJIDAD COM ON ACOM.complejoId = COM.complejoId
            LEFT JOIN ACTIVIDAD_OBJETIVO AOB ON A.actId = AOB.actId
            LEFT JOIN OBJETIVO OB ON AOB.objetivoId = OB.objetivoId
            LEFT JOIN ACTIVIDAD_DURACION ADU ON A.actId = ADU.actId
            LEFT JOIN DURACION DU ON ADU.duracionId = DU.duracion
            WHERE A.nombreActividad IN :nombres
            ORDER BY A.nombreActividad
            LIMIT 6
        """).bindparams(bindparam("nombres", expanding=True))
        
        with engine.connect() as conn:
            result = conn.execute(query, {"nombres": actividades_pred.tolist()})
            actividades_info = [dict(row._mapping) for row in result]

        print(f"✅ Predicción con info completa (hasta 6): {actividades_info}")
        return {"actividades_sugeridas": actividades_info}

    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error inesperado:", str(e))
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