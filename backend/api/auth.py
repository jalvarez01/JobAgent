from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.perfil_service import PerfilService
from backend.schemas.auth import LoginRequest, LoginResponse
from backend.security import crear_token

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    svc = PerfilService(db)
    perfil = svc.login(data.email, data.password)
    if not perfil:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    # Generar token JWT firmado
    token = crear_token(perfil.id, perfil.email)

    return LoginResponse(
        perfil_id=perfil.id,
        nombre_completo=perfil.nombre_completo,
        email=perfil.email,
        access_token=token,
    )