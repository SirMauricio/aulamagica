from fastapi import FastAPI
from api_modelos_combinados import router as modelo_router

app = FastAPI()

app.include_router(modelo_router, prefix="/ia")

@app.get("/")
def root():
    return {"message": "Microservicio IA funcionando"}

