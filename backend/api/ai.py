from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.ranking_ia_service import RankingIAService
from backend.domain.services.entrevista_ia_service import EntrevistaIAService

router = APIRouter()


@router.get("/ranking/{vacante_id}")
def ranking_candidatos_ia(vacante_id: str, db: Session = Depends(get_db)):
    """Devuelve el top de candidatos para una vacante, rerankeado por IA con Groq."""
    try:
        svc = RankingIAService(db)
        return svc.rankear_candidatos(vacante_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando ranking: {e}")


# ============ PREGUNTAS DE ENTREVISTA ============

class GenerarPreguntasRequest(BaseModel):
    perfil_id: str
    vacante_id: str


@router.post("/entrevista/preguntas")
def generar_preguntas_entrevista(
    data: GenerarPreguntasRequest,
    db: Session = Depends(get_db),
):
    """Genera preguntas de entrevista personalizadas según el perfil y la vacante."""
    try:
        svc = EntrevistaIAService(db)
        return svc.generar_preguntas(data.perfil_id, data.vacante_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando preguntas: {e}")


# ============ MENSAJE DE INVITACIÓN ============

class GenerarInvitacionRequest(BaseModel):
    perfil_id: str
    vacante_id: str
    fecha: Optional[str] = None
    modalidad: Optional[str] = None  # presencial, virtual, telefónica
    duracion_minutos: Optional[int] = None
    link_reunion: Optional[str] = None
    nombre_entrevistador: Optional[str] = None


@router.post("/entrevista/invitacion")
def generar_mensaje_invitacion(
    data: GenerarInvitacionRequest,
    db: Session = Depends(get_db),
):
    """Genera el texto del mensaje de invitación a una entrevista."""
    try:
        svc = EntrevistaIAService(db)
        return svc.generar_mensaje_invitacion(
            perfil_id=data.perfil_id,
            vacante_id=data.vacante_id,
            fecha=data.fecha,
            modalidad=data.modalidad,
            duracion_minutos=data.duracion_minutos,
            link_reunion=data.link_reunion,
            nombre_entrevistador=data.nombre_entrevistador,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando mensaje: {e}")