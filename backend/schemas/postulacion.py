from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PostulacionCreate(BaseModel):
    perfil_id: str
    vacante_id: str
    tipo: str = "manual"  # manual | auto | asistida
    notas: Optional[str] = None
    score_match: Optional[str] = None


class PostulacionUpdateEstado(BaseModel):
    estado: str  # postulado | en_revision | entrevista | oferta | descartado | retirado
    notas: Optional[str] = None


class PostulacionResponse(BaseModel):
    id: str
    perfil_id: str
    vacante_id: str
    estado: str
    tipo: str
    notas: Optional[str] = None
    score_match: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Datos de la vacante (se llenan en el servicio)
    vacante_titulo: Optional[str] = None
    vacante_empresa: Optional[str] = None

    model_config = {"from_attributes": True}
