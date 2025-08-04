import os
import re
import pandas as pd
import joblib
import nltk
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

load_dotenv()

nltk.download("stopwords")
from nltk.corpus import stopwords

usuario = os.getenv("DB_USER")
contrasena = os.getenv("DB_PASS")
host = os.getenv("DB_HOST")
puerto = os.getenv("DB_PORT") or "3306"
bd = os.getenv("DB_NAME")

# Crear conexión con SQLAlchemy
engine = create_engine(f"mysql+pymysql://{usuario}:{contrasena}@{host}:{puerto}/{bd}")

query = """
SELECT DISTINCT
    nombreActividad,
    descripcion,
    nivel,
    grado,
    complejidad,
    espacio,
    materiales,
    objetivo,
    tema,
    duracion,
    modalidadNombre
FROM ACTIVIDADES_EDUCATIVAS

"""

df = pd.read_sql(query, engine)

# En caso que queden duplicados exactos, eliminar
df = df.drop_duplicates(subset="nombreActividad", keep="first")

# Directorio de salida
output_path = os.path.join(os.getcwd(), "modelos")
os.makedirs(output_path, exist_ok=True)

# Etiquetas correctas que existen en df para el modelo multisalida
etiquetas = [
    "nivel", "grado", "complejidad", "espacio",
    "materiales", "objetivo", "duracion", "modalidadNombre"
]


# ==========================
# ETIQUETADO Y PREPROCESAMIENTO
# ==========================

def limpiar_texto(texto):
    texto = texto.lower()
    texto = re.sub(r"[^\w\s]", "", texto)
    texto = re.sub(r"\d+", "", texto)
    return texto

df["tema"] = df["tema"].fillna("")
df["descripcion"] = df["descripcion"].fillna("")
df["entrada_texto"] = (df["tema"] + " " + df["descripcion"]).apply(limpiar_texto)

# ==========================
# MODELO NLP MULTISALIDA
# ==========================

y_multi = df[etiquetas].copy()
encoders = {}

for col in y_multi.columns:
    if col == "duracion":
        y_multi[col] = y_multi[col].fillna(10).astype(int)
    else:
        le = LabelEncoder()
        y_multi[col] = y_multi[col].astype(str)
        y_multi[col] = le.fit_transform(y_multi[col])
        encoders[col] = le
        joblib.dump(le, os.path.join(output_path, f"label_encoder_{col}.pkl"))

vectorizer = TfidfVectorizer(stop_words=stopwords.words("spanish"))
X_texto = vectorizer.fit_transform(df["entrada_texto"])

modelo_nlp = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
modelo_nlp.fit(X_texto, y_multi)

joblib.dump(modelo_nlp, os.path.join(output_path, "modelo_nlp.pkl"))
joblib.dump(vectorizer, os.path.join(output_path, "vectorizer_nlp.pkl"))

# ==========================
# MODELO ESTRUCTURADO CLÁSICO
# ==========================

X_struct = df[etiquetas].copy()
for col in etiquetas:
    if col == "duracion":
        X_struct[col] = X_struct[col].fillna(10).astype(int)
    else:
        le = encoders[col]
        X_struct[col] = le.transform(X_struct[col].astype(str))

le_actividad = LabelEncoder()
y_actividad = le_actividad.fit_transform(df["nombreActividad"].astype(str))

modelo_pred = RandomForestClassifier(n_estimators=100, random_state=42)
modelo_pred.fit(X_struct, y_actividad)

joblib.dump(modelo_pred, os.path.join(output_path, "modelo_prediccion.pkl"))
joblib.dump(le_actividad, os.path.join(output_path, "label_encoder_nombreActividad.pkl"))

print("✅ Modelos entrenados y guardados en /modelos correctamente.")

# Validar predicción dummy con forma correcta
pred = modelo_pred.predict(X_struct.iloc[[0]])
print("Predicción ejemplo:", le_actividad.inverse_transform(pred)[0])

print("Número total de actividades:", len(df))
print("Número de actividades únicas:", df["nombreActividad"].nunique())