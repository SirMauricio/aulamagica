import pandas as pd
import joblib
import os
import nltk
import string
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sqlalchemy import create_engine

nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords

# Cargar variables de entorno desde .env
load_dotenv()

usuario = os.getenv("DB_USER")
contrasena = os.getenv("DB_PASS")
host = os.getenv("DB_HOST")
puerto = os.getenv("DB_PORT") or "3306"
bd = os.getenv("DB_NAME")

output_path = "./modelos_entrenados"
os.makedirs(output_path, exist_ok=True)

# Crear conexión con SQLAlchemy
engine = create_engine(f"mysql+pymysql://{usuario}:{contrasena}@{host}:{puerto}/{bd}")

# Conexión y carga de datos
query = """
SELECT A.nombreActividad, M.modalidadNombre, N.nivelNombre, G.gradoNombre, 
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
ORDER BY A.nombreActividad;
"""

# Leer los datos
df = pd.read_sql(query, engine)
df = df.fillna("No especificado")

# Preprocesamiento
df.fillna("No definido", inplace=True)

# Texto de entrada: tema + descripción
df["entrada_texto"] = df["tema"] + " " + df["descripcion"]

# Salidas
etiquetas = [
    "modalidadNombre", "nivelNombre", "gradoNombre", "nombreEspacio",
    "materialCategoria", "complejoNombre", "nombreObjetivo", "duracion"
]

# Codificamos las salidas
label_encoders = {}
y_encoded = pd.DataFrame()

for col in etiquetas:
    le = LabelEncoder()
    y_encoded[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(df["entrada_texto"], y_encoded, test_size=0.2, random_state=42)

# Pipeline de procesamiento + modelo
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words=stopwords.words('spanish'), lowercase=True)),
    ('clf', MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42)))
])

pipeline.fit(X_train, y_train)

# Directorio base del script actual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ruta para guardar modelos (backend/ia)
output_path = os.path.join(BASE_DIR, "..", "ia")
os.makedirs(output_path, exist_ok=True)

# Guardar pipeline completo
joblib.dump(pipeline, os.path.join(output_path, "modelo_nlp.pkl"))

# Guardar label encoders
for col, le in label_encoders.items():
    joblib.dump(le, os.path.join(output_path, f"label_encoder_{col}.pkl"))


print("Modelo entrenado y guardado exitosamente en ia/")
