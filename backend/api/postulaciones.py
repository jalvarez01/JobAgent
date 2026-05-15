from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.postulacion_service import PostulacionService
from backend.infrastructure.persistence.repositories.postulacion_repo import PostulacionRepository
from backend.schemas.postulacion import PostulacionCreate, PostulacionUpdateEstado, PostulacionResponse
from backend.schemas.traza import TrazaResponse

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> PostulacionService:
    return PostulacionService(db)


@router.post("/", response_model=PostulacionResponse, status_code=201)
def crear(data: PostulacionCreate, svc: PostulacionService = Depends(_service)):
    try:
        return svc.crear_postulacion(data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/", response_model=list[PostulacionResponse])
def listar_todas(svc: PostulacionService = Depends(_service)):
    """Lista todas las postulaciones del sistema. Para uso del admin."""
    return svc.listar_todas()


@router.get("/perfil/{perfil_id}", response_model=list[PostulacionResponse])
def listar_por_perfil(perfil_id: str, svc: PostulacionService = Depends(_service)):
    return svc.listar_por_perfil(perfil_id)


@router.get("/{postulacion_id}", response_model=PostulacionResponse)
def obtener(postulacion_id: str, svc: PostulacionService = Depends(_service)):
    post = svc.obtener(postulacion_id)
    if not post:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    return post


@router.patch("/{postulacion_id}/estado", response_model=PostulacionResponse)
def cambiar_estado(
    postulacion_id: str,
    data: PostulacionUpdateEstado,
    svc: PostulacionService = Depends(_service),
):
    post = svc.cambiar_estado(postulacion_id, data.estado, data.notas)
    if not post:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    return post


@router.get("/{postulacion_id}/trazas", response_model=list[TrazaResponse])
def listar_trazas(postulacion_id: str, db: Session = Depends(get_db)):
    repo = PostulacionRepository(db)
    return repo.get_trazas(postulacion_id)