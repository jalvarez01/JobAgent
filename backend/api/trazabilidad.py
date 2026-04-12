from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.postulacion_service import PostulacionService
from backend.schemas.traza import TrazaResponse

router = APIRouter()


@router.get("/{perfil_id}", response_model=list[TrazaResponse])
def obtener_trazas(
    perfil_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    svc = PostulacionService(db)
    return svc.obtener_trazas(perfil_id, limit)
