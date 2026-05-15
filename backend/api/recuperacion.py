from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.password_reset_service import PasswordResetService
from backend.schemas.password_reset import (
    SolicitarRecuperacionRequest,
    SolicitarRecuperacionResponse,
    ValidarTokenResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)

router = APIRouter()


def _service(db: Session = Depends(get_db)) -> PasswordResetService:
    return PasswordResetService(db)


@router.post("/recuperar", response_model=SolicitarRecuperacionResponse)
def solicitar_recuperacion(
    data: SolicitarRecuperacionRequest,
    svc: PasswordResetService = Depends(_service),
):
    """Genera un token temporal para recuperar la contraseña asociada a un email."""
    return svc.solicitar_recuperacion(data.email)


@router.get("/recuperar/validar/{token}", response_model=ValidarTokenResponse)
def validar_token(token: str, svc: PasswordResetService = Depends(_service)):
    """Verifica si un token de recuperación es válido y no ha expirado."""
    return svc.validar_token(token)


@router.post("/recuperar/cambiar", response_model=ResetPasswordResponse)
def cambiar_password(
    data: ResetPasswordRequest,
    svc: PasswordResetService = Depends(_service),
):
    """Cambia la contraseña del usuario asociado a un token válido."""
    try:
        return svc.cambiar_password(data.token, data.nueva_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))