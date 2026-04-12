from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import ALLOWED_ORIGINS, DATA_DIR
from backend.infrastructure.persistence.database import init_db, SessionLocal
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.api import cv, perfil, vacantes, postulaciones, trazabilidad, pipeline

app = FastAPI(
    title="JobAgent API",
    description="Profile Manager - MVP con arquitectura agéntica",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv.router, prefix="/cv", tags=["CV"])
app.include_router(perfil.router, prefix="/perfiles", tags=["Perfiles"])
app.include_router(vacantes.router, prefix="/vacantes", tags=["Vacantes"])
app.include_router(postulaciones.router, prefix="/postulaciones", tags=["Postulaciones"])
app.include_router(trazabilidad.router, prefix="/trazas", tags=["Trazabilidad"])
app.include_router(pipeline.router, prefix="/pipeline", tags=["Pipeline"])


@app.on_event("startup")
def on_startup():
    init_db()

    db = SessionLocal()
    try:
        repo = VacanteRepository(db)
        csv_path = DATA_DIR / "vacantes.csv"
        inserted = repo.seed_from_csv(csv_path)
        if inserted:
            print(f"[seed] {inserted} vacantes cargadas desde CSV")
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
