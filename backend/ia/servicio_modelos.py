from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np

app = FastAPI()

ruta_base = os.path.dirname(__file__)  # carpeta backend/ia
ruta_modelos = os.path.join(ruta_base, "modelos")

# Cargar modelos y encoders al iniciar el servidor
modelo_pred = joblib.load(os.path.join(ruta_modelos, "modelo_prediccion.pkl"))
le_actividad = joblib.load(os.path.join(ruta_modelos, "label_encoder_nombreActividad.pkl"))

modelo_nlp = joblib.load(os.path.join(ruta_modelos, "modelo_nlp.pkl"))
vectorizer_nlp = joblib.load(os.path.join(ruta_modelos, "vectorizer_nlp.pkl"))


# Encoders para campos estructurados (deben coincidir con los usados en entrenamiento)
campos_etiquetas = [
    "modalidadNombre", "nivelNombre", "gradoNombre",
    "nombreEspacio", "materialCategoria", "complejoNombre",
    "nombreObjetivo", "duracion"
]

encoders = {}
for campo in campos_etiquetas:
    if campo == "duracion":
        continue  # ❗ No se carga encoder para duración
    ruta_encoder = os.path.join(ruta_modelos, f"label_encoder_{campo}.pkl")
    encoders[campo] = joblib.load(ruta_encoder)


# Modelos Pydantic para validación de input
class DatosEstructurados(BaseModel):
    modalidadNombre: str
    nivelNombre: str
    gradoNombre: str
    nombreEspacio: str
    materialCategoria: str
    complejoNombre: str
    nombreObjetivo: str
    duracion: int

class TextoLibre(BaseModel):
    texto: str


@app.post("/predict")
def predecir_actividad(datos: DatosEstructurados):
    print("📥 Datos recibidos:", datos.dict())  # <-- Aquí imprimes los datos recibidos
    try:
        X_input = []
        for campo in campos_etiquetas:
            valor = datos.dict()[campo]
            if campo == "duracion":
                # Usar valor numérico directamente
                valor_codificado = valor
            else:
                le = encoders[campo]
                valor_codificado = le.transform([valor])[0]
            X_input.append(valor_codificado)
        
        X_np = np.array(X_input).reshape(1, -1)
        y_pred = modelo_pred.predict(X_np)
        actividad_pred = le_actividad.inverse_transform(y_pred)[0]

        print("✅ Predicción realizada:", actividad_pred)
        return {"actividad_sugerida": actividad_pred}

    except Exception as e:
        print("❌ Error inesperado:", str(e))
        raise HTTPException(status_code=400, detail=f"Error en predicción: {str(e)}")



@app.post("/predict_nlp")
def predecir_actividad_nlp(data: TextoLibre):
    try:
        texto = data.texto.lower()
        # Aquí puedes agregar limpieza de texto si quieres
        X_texto = vectorizer_nlp.transform([texto])
        y_pred_multi = modelo_nlp.predict(X_texto)
        
        resultados = {}
        for i, campo in enumerate(campos_etiquetas):
            le = encoders[campo]
            valor = le.inverse_transform([y_pred_multi[0][i]])[0]
            resultados[campo] = valor
        
        return resultados
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en predicción NLP: {str(e)}")

@app.get("/")
def raiz():
    return {"mensaje": "Microservicio IA funcionando correctamente"}

@app.post("/predict")
def predecir_actividad(datos: DatosEstructurados):
    print("📥 Datos recibidos:", datos.dict())  # <-- Aquí imprimes los datos recibidos
    try:
        X_input = []
        for campo in campos_etiquetas:
            valor = datos.dict()[campo]
            le = encoders[campo]
            valor_codificado = le.transform([valor])[0]
            X_input.append(valor_codificado)
        
        X_np = np.array(X_input).reshape(1, -1)
        y_pred = modelo_pred.predict(X_np)
        actividad_pred = le_actividad.inverse_transform(y_pred)[0]
        

        print("✅ Predicción realizada:", actividad_pred)
        return {"actividad_sugerida": actividad_pred}

    except ValidationError as ve:
        print("❌ Error de validación:", ve.errors())
        raise HTTPException(status_code=422, detail=ve.errors())
    except Exception as e:
        print("❌ Error inesperado:", str(e))
        raise HTTPException(status_code=400, detail=f"Error en predicción: {str(e)}")

    
