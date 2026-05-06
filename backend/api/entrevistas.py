from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.entrevista_service import EntrevistaService
from backend.schemas.entrevista import EntrevistaCreate, EntrevistaUpdate, EntrevistaResponse

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> EntrevistaService:
    return EntrevistaService(db)


@router.post("/", response_model=EntrevistaResponse, status_code=201)
def crear_entrevista(data: EntrevistaCreate, svc: EntrevistaService = Depends(_service)):
    return svc.crear_entrevista(data)


@router.get("/", response_model=list[EntrevistaResponse])
def listar_todas(svc: EntrevistaService = Depends(_service)):
    """Endpoint para admin: lista todas las entrevistas."""
    return svc.listar_todas()


@router.get("/perfil/{perfil_id}", response_model=list[EntrevistaResponse])
def listar_por_perfil(perfil_id: str, svc: EntrevistaService = Depends(_service)):
    """Endpoint para candidatos: solo sus propias entrevistas."""
    return svc.listar_por_perfil(perfil_id)


@router.get("/{entrevista_id}", response_model=EntrevistaResponse)
def obtener(entrevista_id: str, svc: EntrevistaService = Depends(_service)):
    entrevista = svc.obtener(entrevista_id)
    if not entrevista:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    return entrevista


@router.put("/{entrevista_id}", response_model=EntrevistaResponse)
def actualizar(entrevista_id: str, data: EntrevistaUpdate, svc: EntrevistaService = Depends(_service)):
    entrevista = svc.actualizar(entrevista_id, data)
    if not entrevista:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    return entrevista


@router.delete("/{entrevista_id}", status_code=204)
def eliminar(entrevista_id: str, svc: EntrevistaService = Depends(_service)):
    if not svc.eliminar(entrevista_id):
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")