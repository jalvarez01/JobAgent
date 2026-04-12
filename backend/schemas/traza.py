from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TrazaResponse(BaseModel):
    id: str
    perfil_id: str
    postulacion_id: Optional[str] = None
    tipo: str
    descripcion: str
    origen: str
    extra_data: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
