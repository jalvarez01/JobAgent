from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=8)


class LoginResponse(BaseModel):
    perfil_id: str
    nombre_completo: str
    email: str
    access_token: str
    token_type: str = "bearer"
    message: str = "Inicio de sesión exitoso"