from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.postulacion_service import PostulacionService
from backend.schemas.postulacion import PostulacionCreate, PostulacionUpdateEstado, PostulacionResponse

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> PostulacionService:
    return PostulacionService(db)


@router.post("/", response_model=PostulacionResponse, status_code=201)
def postular(data: PostulacionCreate, svc: PostulacionService = Depends(_service)):
    try:
        return svc.postular(data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/perfil/{perfil_id}", response_model=list[PostulacionResponse])
def listar_postulaciones(perfil_id: str, svc: PostulacionService = Depends(_service)):
    return svc.listar_por_perfil(perfil_id)


@router.patch("/{postulacion_id}/estado", response_model=PostulacionResponse)
def cambiar_estado(
    postulacion_id: str,
    data: PostulacionUpdateEstado,
    svc: PostulacionService = Depends(_service),
):
    try:
        result = svc.cambiar_estado(postulacion_id, data.estado, data.notas)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not result:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    return result
