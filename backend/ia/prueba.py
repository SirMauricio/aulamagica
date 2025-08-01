import joblib
import os
import pandas as pd
import numpy as np

# Ruta a carpeta con modelos y encoders
output_path = os.path.join(os.getcwd(), "modelos")

# Lista de columnas usadas en el modelo
etiquetas = [
    "modalidadNombre", "nivelNombre", "gradoNombre",
    "nombreEspacio", "materialCategoria", "complejoNombre",
    "nombreObjetivo", "duracion"
]

# Cargar modelo y encoders guardados
modelo_pred = joblib.load(os.path.join(output_path, "modelo_prediccion.pkl"))

encoders = {}
for col in etiquetas:
    if col != "duracion":
        encoders[col] = joblib.load(os.path.join(output_path, f"label_encoder_{col}.pkl"))

def preparar_entrada(entrada_dict, usar_categoria_desconocida=False):
    X_pred = []
    for col in etiquetas:
        val = entrada_dict.get(col)
        if col == "duracion":
            if val is None:
                val = 10
            X_pred.append(int(val))
        else:
            le = encoders[col]
            val_str = str(val)
            if val_str in le.classes_:
                X_pred.append(le.transform([val_str])[0])
            else:
                if usar_categoria_desconocida:
                    X_pred.append(0)  # Asignar categoría "desconocida"
                else:
                    raise ValueError(f"Etiqueta desconocida para '{col}': '{val_str}'")
    # Devuelve DataFrame con columnas para evitar warning de sklearn
    return pd.DataFrame([X_pred], columns=etiquetas)

# Ejemplo de entrada para probar
entrada = {
    'modalidadNombre': 'Grupal',
    'nivelNombre': 'Primaria',
    'gradoNombre': 'Segundo',  # Podría no estar en entrenamiento
    'nombreEspacio': 'Salón',
    'materialCategoria': 'Ninguno',
    'complejoNombre': 'Fácil',
    'nombreObjetivo': 'Integración',
    'duracion': 15
}

try:
    X = preparar_entrada(entrada, usar_categoria_desconocida=True)
    pred = modelo_pred.predict(X)
    print("Predicción:", pred[0])
except ValueError as e:
    print("❌ Error:", e)
