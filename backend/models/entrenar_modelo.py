# entrenar_modelo.py
import os
import pandas as pd
import pickle
import joblib
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Cargar variables de entorno desde .env
load_dotenv()

usuario = os.getenv("DB_USER")
contrasena = os.getenv("DB_PASS")
host = os.getenv("DB_HOST")
puerto = os.getenv("DB_PORT") or "3306"
bd = os.getenv("DB_NAME")

# Crear conexión con SQLAlchemy
engine = create_engine(f"mysql+pymysql://{usuario}:{contrasena}@{host}:{puerto}/{bd}")

# Consulta SQL (ya proporcionada por ti)
query = """
SELECT A.actId, A.nombreActividad, M.modalidadNombre, N.nivelNombre, G.gradoNombre, 
E.nombreEspacio, MAT.materialCategoria, COM.complejoNombre, OB.nombreObjetivo, 
DU.duracion, A.tema, A.descripcion
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
ORDER BY A.nombreActividad
"""

# Leer los datos
df = pd.read_sql(query, engine)
df = df.fillna("No especificado")

# Seleccionamos variables de entrada y salida
X = df.drop(columns=["actId", "nombreActividad", "tema", "descripcion"])
y = df["nombreActividad"]

# Codificación de columnas categóricas
label_encoders = {}
X_encoded = X.copy()

for col in X.columns:
    le = LabelEncoder()
    X_encoded[col] = le.fit_transform(X[col])
    label_encoders[col] = le

# Codificar la salida (nombreActividad)
le_y = LabelEncoder()
y_encoded = le_y.fit_transform(y)
label_encoders["nombreActividad"] = le_y

# Entrenamiento del modelo
X_train, X_test, y_train, y_test = train_test_split(X_encoded, y_encoded, test_size=0.2, random_state=42)
modelo = RandomForestClassifier(n_estimators=100, random_state=42)
modelo.fit(X_train, y_train)

# guardar modelo entrenado y codificadores
output_path = os.path.join("..", "ia")
os.makedirs(output_path, exist_ok=True)

joblib.dump(modelo, os.path.join(output_path, "modelo_entrenado.pkl"))
joblib.dump(label_encoders, os.path.join(output_path, "label_encoders.pkl"))

print("Modelo entrenado y guardado en 'ia/'")
