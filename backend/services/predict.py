import sys
import json
import joblib
import os

# Carga modelos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "modelo_nlp.pkl")
pipeline = joblib.load(model_path)

label_encoders = {}
for col in ["modalidadNombre", "nivelNombre", "gradoNombre", "nombreEspacio", "materialCategoria", "complejoNombre", "nombreObjetivo", "duracion"]:
    le_path = os.path.join(BASE_DIR, f"label_encoder_{col}.pkl")
    label_encoders[col] = joblib.load(le_path)

def predecir(texto_usuario):
    pred_encoded = pipeline.predict([texto_usuario])[0]
    pred_decoded = {}
    for i, col in enumerate(label_encoders):
        pred_decoded[col] = label_encoders[col].inverse_transform([pred_encoded[i]])[0]
    return pred_decoded

if __name__ == "__main__":
    # Recibir texto por argumento
    texto = sys.argv[1] if len(sys.argv) > 1 else ""
    resultado = predecir(texto)
    print(json.dumps(resultado))
