from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EntrevistaCreate(BaseModel):
    perfil_id: str
    vacante_id: Optional[str] = None
    postulacion_id: Optional[str] = None
    fecha_entrevista: Optional[datetime] = None
    tipo: str = Field(default="tecnica")
    entrevistador: Optional[str] = Field(None, max_length=200)
    duracion_minutos: Optional[int] = Field(None, ge=0, le=600)
    estado: str = Field(default="programada")


class EntrevistaUpdate(BaseModel):
    fecha_entrevista: Optional[datetime] = None
    tipo: Optional[str] = None
    entrevistador: Optional[str] = Field(None, max_length=200)
    duracion_minutos: Optional[int] = Field(None, ge=0, le=600)
    puntaje: Optional[int] = Field(None, ge=0, le=100)
    nivel: Optional[str] = None
    estado: Optional[str] = None

    # Sub-puntajes
    puntaje_tecnico: Optional[int] = Field(None, ge=0, le=100)
    puntaje_comunicacion: Optional[int] = Field(None, ge=0, le=100)
    puntaje_conocimientos: Optional[int] = Field(None, ge=0, le=100)
    puntaje_actitud: Optional[int] = Field(None, ge=0, le=100)

    fortalezas: Optional[str] = None
    debilidades: Optional[str] = None
    recomendaciones: Optional[str] = None
    notas_admin: Optional[str] = None


class EntrevistaResponse(BaseModel):
    id: str
    perfil_id: str
    vacante_id: Optional[str] = None
    postulacion_id: Optional[str] = None

    fecha_entrevista: Optional[datetime] = None
    tipo: str
    entrevistador: Optional[str] = None
    duracion_minutos: Optional[int] = None

    puntaje: Optional[int] = None
    nivel: Optional[str] = None
    estado: str

    # Sub-puntajes
    puntaje_tecnico: Optional[int] = None
    puntaje_comunicacion: Optional[int] = None
    puntaje_conocimientos: Optional[int] = None
    puntaje_actitud: Optional[int] = None

    fortalezas: Optional[str] = None
    debilidades: Optional[str] = None
    recomendaciones: Optional[str] = None
    notas_admin: Optional[str] = None

    perfil_nombre: Optional[str] = None
    perfil_email: Optional[str] = None
    vacante_titulo: Optional[str] = None
    vacante_empresa: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}