from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.perfil_service import PerfilService
from backend.schemas.cv import PerfilCreate, PerfilUpdate, PerfilResponse
from backend.security import crear_token, get_current_user, verificar_acceso_perfil

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> PerfilService:
    return PerfilService(db)


@router.post("/", status_code=201)
def crear_perfil(data: PerfilCreate, svc: PerfilService = Depends(_service)):
    """Endpoint público: registro. Devuelve perfil + token JWT."""
    try:
        perfil = svc.crear_perfil(data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    token = crear_token(perfil.id, perfil.email)

    return {
        **perfil.model_dump(),
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/", response_model=list[PerfilResponse])
def listar_perfiles(
    svc: PerfilService = Depends(_service),
    current_user=Depends(get_current_user),
):
    """Endpoint protegido: solo usuarios autenticados pueden listar."""
    return svc.listar_perfiles()


@router.get("/{perfil_id}", response_model=PerfilResponse)
def obtener_perfil(
    perfil_id: str,
    svc: PerfilService = Depends(_service),
    current_user=Depends(get_current_user),
):
    """Solo el dueño del perfil puede acceder a sus datos."""
    verificar_acceso_perfil(perfil_id, current_user)
    perfil = svc.obtener_perfil(perfil_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil


@router.put("/{perfil_id}", response_model=PerfilResponse)
def actualizar_perfil(
    perfil_id: str,
    data: PerfilUpdate,
    svc: PerfilService = Depends(_service),
    current_user=Depends(get_current_user),
):
    """Solo el dueño puede actualizar su perfil."""
    verificar_acceso_perfil(perfil_id, current_user)
    perfil = svc.actualizar_perfil(perfil_id, data)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil


@router.delete("/{perfil_id}", status_code=204)
def eliminar_perfil(
    perfil_id: str,
    svc: PerfilService = Depends(_service),
    current_user=Depends(get_current_user),
):
    """Solo el dueño puede eliminar su perfil."""
    verificar_acceso_perfil(perfil_id, current_user)
    if not svc.eliminar_perfil(perfil_id):
        raise HTTPException(status_code=404, detail="Perfil no encontrado")