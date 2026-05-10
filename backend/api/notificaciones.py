from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.notificacion_service import NotificacionService
from backend.schemas.notificacion import NotificacionResponse
from backend.security import get_current_user, verificar_acceso_perfil

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> NotificacionService:
    return NotificacionService(db)


@router.get("/perfil/{perfil_id}", response_model=list[NotificacionResponse])
def listar_notificaciones(
    perfil_id: str,
    solo_no_leidas: bool = False,
    svc: NotificacionService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    return svc.listar_por_perfil(perfil_id, solo_no_leidas)


@router.get("/perfil/{perfil_id}/count")
def contar_no_leidas(
    perfil_id: str,
    svc: NotificacionService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    return {"no_leidas": svc.contar_no_leidas(perfil_id)}


@router.patch("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_leida(
    notificacion_id: str,
    svc: NotificacionService = Depends(_service),
    current_user=Depends(get_current_user),
):
    notif = svc.marcar_leida(notificacion_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    # Validar que la notificación pertenezca al usuario
    verificar_acceso_perfil(notif.perfil_id, current_user)
    return notif


@router.patch("/perfil/{perfil_id}/leer-todas")
def marcar_todas_leidas(
    perfil_id: str,
    svc: NotificacionService = Depends(_service),
    current_user=Depends(get_current_user),
):
    verificar_acceso_perfil(perfil_id, current_user)
    cantidad = svc.marcar_todas_leidas(perfil_id)
    return {"marcadas": cantidad}


@router.delete("/{notificacion_id}", status_code=204)
def eliminar(
    notificacion_id: str,
    svc: NotificacionService = Depends(_service),
    current_user=Depends(get_current_user),
):
    if not svc.eliminar(notificacion_id):
        raise HTTPException(status_code=404, detail="Notificación no encontrada")