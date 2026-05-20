from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VacanteCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=300)
    empresa: str = Field(..., min_length=2, max_length=200)
    ubicacion: Optional[str] = Field(None, max_length=100)
    modalidad: Optional[str] = Field(None, pattern="^(presencial|remoto|hibrido)$")
    salario_min: Optional[float] = Field(None, ge=0)
    salario_max: Optional[float] = Field(None, ge=0)
    descripcion: Optional[str] = None
    requisitos: Optional[str] = None  # skills separados por ;
    url: Optional[str] = Field(None, max_length=500)
    estado: str = "activa"
    area: Optional[str] = Field(None, max_length=50)


class VacanteUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=300)
    empresa: Optional[str] = Field(None, min_length=2, max_length=200)
    ubicacion: Optional[str] = Field(None, max_length=100)
    modalidad: Optional[str] = None
    salario_min: Optional[float] = Field(None, ge=0)
    salario_max: Optional[float] = Field(None, ge=0)
    descripcion: Optional[str] = None
    requisitos: Optional[str] = None
    url: Optional[str] = Field(None, max_length=500)
    estado: Optional[str] = None
    area: Optional[str] = Field(None, max_length=50)


class VacanteResponse(BaseModel):
    id: str
    titulo: str
    empresa: str
    ubicacion: Optional[str] = None
    modalidad: Optional[str] = None
    salario_min: Optional[float] = None
    salario_max: Optional[float] = None
    descripcion: Optional[str] = None
    requisitos: Optional[str] = None
    url: Optional[str] = None
    estado: str = "activa"
    area: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class VacanteConScore(VacanteResponse):
    """Vacante con score de matching para recomendaciones."""

    score: float = 0.0
    skills_match: list[str] = []
    skills_faltantes: list[str] = []