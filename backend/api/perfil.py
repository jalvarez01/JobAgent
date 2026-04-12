from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.perfil_service import PerfilService
from backend.schemas.cv import PerfilCreate, PerfilUpdate, PerfilResponse

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> PerfilService:
    return PerfilService(db)


@router.post("/", response_model=PerfilResponse, status_code=201)
def crear_perfil(data: PerfilCreate, svc: PerfilService = Depends(_service)):
    try:
        return svc.crear_perfil(data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/", response_model=list[PerfilResponse])
def listar_perfiles(svc: PerfilService = Depends(_service)):
    return svc.listar_perfiles()


@router.get("/{perfil_id}", response_model=PerfilResponse)
def obtener_perfil(perfil_id: str, svc: PerfilService = Depends(_service)):
    perfil = svc.obtener_perfil(perfil_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil


@router.put("/{perfil_id}", response_model=PerfilResponse)
def actualizar_perfil(perfil_id: str, data: PerfilUpdate, svc: PerfilService = Depends(_service)):
    perfil = svc.actualizar_perfil(perfil_id, data)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil


@router.delete("/{perfil_id}", status_code=204)
def eliminar_perfil(perfil_id: str, svc: PerfilService = Depends(_service)):
    eliminado = svc.eliminar_perfil(perfil_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
