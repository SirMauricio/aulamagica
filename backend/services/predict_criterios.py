import sys
import json
import joblib
import os
import pandas as pd

# Carga modelo y encoders
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
modelo = joblib.load(os.path.join(BASE_DIR, "modelo_entrenado.pkl"))
label_encoders = joblib.load(os.path.join(BASE_DIR, "label_encoders.pkl"))

# Lista de columnas de entrada esperadas (orden importante)
columnas_entrada = [
    "modalidadNombre", "nivelNombre", "gradoNombre", "nombreEspacio",
    "materialCategoria", "complejoNombre", "nombreObjetivo", "duracion"
]

def predecir(input_json):
    # Convertir input JSON a DataFrame
    df = pd.DataFrame([input_json])

    # Codificar con los label encoders cargados
    for col in columnas_entrada:
        le = label_encoders[col]
        valor = df.at[0, col]
        # Validar que el valor esté en el encoder
        if valor not in le.classes_:
            # Si no está, usar la clase más frecuente o fallback (la clase 0)
            valor_cod = 0
        else:
            valor_cod = le.transform([valor])[0]
        df.at[0, col] = valor_cod

    # Predecir actividad codificada
    pred_cod = modelo.predict(df)[0]

    # Decodificar nombreActividad
    le_y = label_encoders["nombreActividad"]
    pred_decod = le_y.inverse_transform([pred_cod])[0]

    return pred_decod

if __name__ == "__main__":
    # El input se pasa como JSON string en argv[1]
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input JSON received"}))
        sys.exit(1)

    input_json = json.loads(sys.argv[1])
    resultado = predecir(input_json)
    print(json.dumps({"actividad_predicha": resultado}))
