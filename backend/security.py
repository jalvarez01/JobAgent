"""
Módulo de seguridad: JWT + dependencias FastAPI para proteger endpoints.

Implementa la HU18 - Proteger datos del usuario:
- Cifrado: passwords con SHA-256 + salt (en perfil_model.py)
- Tokens JWT firmados con clave secreta para autenticación stateless
- Validación de permisos: cada usuario solo accede a sus propios datos
- Bloqueo de accesos no autorizados con HTTP 401/403
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository


# Clave secreta para firmar tokens. En producción debe venir de variable de entorno.
JWT_SECRET = os.getenv("JWT_SECRET", "jobagent-dev-secret-key-change-in-production-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Esquema de autenticación HTTP Bearer (Authorization: Bearer <token>)
security_scheme = HTTPBearer(auto_error=False)


def crear_token(perfil_id: str, email: str) -> str:
    """Genera un JWT firmado con el id del perfil y su email."""
    payload = {
        "sub": perfil_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decodificar_token(token: str) -> dict:
    """Valida y decodifica un JWT. Retorna el payload o lanza HTTPException."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado. Inicia sesión nuevamente.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido. Acceso no autorizado.",
        )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """
    Dependencia que extrae el usuario actual desde el token JWT.
    Bloquea el acceso si no hay token o si es inválido.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere autenticación. Inicia sesión.",
        )

    payload = decodificar_token(credentials.credentials)
    perfil_id = payload.get("sub")
    if not perfil_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token mal formado.",
        )

    repo = PerfilRepository(db)
    perfil = repo.get_by_id(perfil_id)
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
        )

    return perfil


def verificar_acceso_perfil(perfil_id: str, current_user) -> None:
    """
    Verifica que el usuario autenticado solo acceda a sus propios datos.
    Lanza HTTP 403 si intenta acceder a datos de otro usuario.
    """
    if current_user.id != perfil_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a estos datos.",
        )