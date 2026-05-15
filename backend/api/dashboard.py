from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.dashboard_service import DashboardService

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


@router.get("/")
def resumen(svc: DashboardService = Depends(_service)):
    """Devuelve todas las métricas del dashboard en una sola respuesta."""
    return svc.resumen_completo()


@router.get("/metricas")
def metricas_generales(svc: DashboardService = Depends(_service)):
    return svc.metricas_generales()


@router.get("/skills/demandados")
def top_skills_demandados(limit: int = 10, svc: DashboardService = Depends(_service)):
    return svc.top_skills(limit)


@router.get("/skills/candidatos")
def top_skills_candidatos(limit: int = 10, svc: DashboardService = Depends(_service)):
    return svc.top_skills_candidatos(limit)


@router.get("/vacantes/populares")
def vacantes_populares(limit: int = 5, svc: DashboardService = Depends(_service)):
    return svc.vacantes_mas_populares(limit)


@router.get("/distribucion-educativa")
def distribucion_educativa(svc: DashboardService = Depends(_service)):
    return svc.distribucion_nivel_educativo()


@router.get("/tasa-match")
def tasa_match(svc: DashboardService = Depends(_service)):
    return svc.tasa_match_promedio()