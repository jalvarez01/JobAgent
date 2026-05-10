from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.favorito_service import FavoritoService
from backend.schemas.favorito import FavoritoCreate, FavoritoResponse
from backend.security import get_current_user, verificar_acceso_perfil

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> FavoritoService:
    return FavoritoService(db)


@router.post("/", response_model=FavoritoResponse, status_code=201)
def guardar_favorito(
    data: FavoritoCreate,
    svc: FavoritoService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(data.perfil_id, current_user)
    favorito, _ = svc.guardar_favorito(data.perfil_id, data.vacante_id)
    return favorito


@router.get("/perfil/{perfil_id}", response_model=list[FavoritoResponse])
def listar_favoritos(
    perfil_id: str,
    svc: FavoritoService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    return svc.listar_favoritos(perfil_id)


@router.get("/check/{perfil_id}/{vacante_id}")
def es_favorito(
    perfil_id: str,
    vacante_id: str,
    svc: FavoritoService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    return {"es_favorito": svc.es_favorito(perfil_id, vacante_id)}


@router.delete("/{perfil_id}/{vacante_id}", status_code=204)
def eliminar_favorito(
    perfil_id: str,
    vacante_id: str,
    svc: FavoritoService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    if not svc.eliminar_favorito(perfil_id, vacante_id):
        raise HTTPException(status_code=404, detail="Favorito no encontrado")