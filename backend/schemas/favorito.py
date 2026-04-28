from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FavoritoCreate(BaseModel):
    perfil_id: str
    vacante_id: str


class FavoritoResponse(BaseModel):
    id: str
    perfil_id: str
    vacante_id: str
    created_at: Optional[datetime] = None

    # Datos enriquecidos de la vacante
    vacante_titulo: Optional[str] = None
    vacante_empresa: Optional[str] = None
    vacante_ubicacion: Optional[str] = None
    vacante_modalidad: Optional[str] = None
    vacante_salario_min: Optional[float] = None
    vacante_salario_max: Optional[float] = None

    model_config = {"from_attributes": True}