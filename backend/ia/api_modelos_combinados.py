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
SELECT 
    A.nombreActividad,
    A.tema,
    A.descripcion,
    MIN(M.modalidadNombre) AS modalidadNombre,
    MIN(N.nivelNombre) AS nivelNombre,
    MIN(G.gradoNombre) AS gradoNombre,
    MIN(E.nombreEspacio) AS nombreEspacio,
    MIN(MAT.materialCategoria) AS materialCategoria,
    MIN(COM.complejoNombre) AS complejoNombre,
    MIN(OB.nombreObjetivo) AS nombreObjetivo,
    MIN(DU.duracion) AS duracion
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
LEFT JOIN DURACION DU ON ADU.duracionId = DU.duracionId
GROUP BY 
    A.nombreActividad, A.tema, A.descripcion
"""

df = pd.read_sql(query, engine)
df = df.drop_duplicates(subset="nombreActividad", keep="first")

# Directorio de salida
output_path = os.path.join(os.getcwd(), "modelos")
os.makedirs(output_path, exist_ok=True)

# Etiquetas estructuradas
etiquetas = [
    "modalidadNombre", "nivelNombre", "gradoNombre",
    "nombreEspacio", "materialCategoria", "complejoNombre",
    "nombreObjetivo", "duracion"
]

# ==========================
# ETIQUETADO Y PREPROCESAMIENTO
# ==========================

# Limpiar texto
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
        y_multi[col] = y_multi[col].fillna(10).astype(int)  # dejar como int
    else:
        le = LabelEncoder()
        y_multi[col] = y_multi[col].astype(str)
        y_multi[col] = le.fit_transform(y_multi[col])
        encoders[col] = le
        joblib.dump(le, os.path.join(output_path, f"label_encoder_{col}.pkl"))

# Vectorizar texto
vectorizer = TfidfVectorizer(stop_words=stopwords.words("spanish"))
X_texto = vectorizer.fit_transform(df["entrada_texto"])

# Entrenar modelo NLP multietiqueta
modelo_nlp = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
modelo_nlp.fit(X_texto, y_multi)

# Guardar modelo NLP
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

# Etiqueta objetivo: nombre de actividad
le_actividad = LabelEncoder()
y_actividad = le_actividad.fit_transform(df["nombreActividad"].astype(str))

# Entrenar modelo clásico
modelo_pred = RandomForestClassifier(n_estimators=100, random_state=42)
modelo_pred.fit(X_struct, y_actividad)

# Guardar modelo clásico
joblib.dump(modelo_pred, os.path.join(output_path, "modelo_prediccion.pkl"))
joblib.dump(le_actividad, os.path.join(output_path, "label_encoder_nombreActividad.pkl"))

print("✅ Modelos entrenados y guardados en /modelos correctamente.")

# Validar predicción dummy
pred = modelo_pred.predict([X_struct.iloc[0]])
print("Predicción ejemplo:", le_actividad.inverse_transform(pred)[0])
