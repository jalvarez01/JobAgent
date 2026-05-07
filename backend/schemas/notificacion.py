from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificacionResponse(BaseModel):
    id: str
    perfil_id: str
    postulacion_id: Optional[str] = None
    entrevista_id: Optional[str] = None
    tipo: str
    titulo: str
    mensaje: str
    leida: bool
    leida_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}