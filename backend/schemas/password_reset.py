from typing import Optional

from pydantic import BaseModel, EmailStr


class SolicitarRecuperacionRequest(BaseModel):
    email: str


class SolicitarRecuperacionResponse(BaseModel):
    mensaje: str
    # Token opcional. En producción NO se devuelve; aquí se devuelve para mostrar
    # el enlace en pantalla porque no tenemos servidor de correo configurado.
    token: Optional[str] = None


class ValidarTokenResponse(BaseModel):
    valido: bool
    email: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str


class ResetPasswordResponse(BaseModel):
    mensaje: str