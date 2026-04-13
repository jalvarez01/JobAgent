from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class NivelEducativo(str, Enum):
    bachiller = "bachiller"
    tecnico = "tecnico"
    tecnologo = "tecnologo"
    profesional = "profesional"
    especialista = "especialista"
    maestria = "maestria"
    doctorado = "doctorado"


class Modalidad(str, Enum):
    presencial = "presencial"
    remoto = "remoto"
    hibrido = "hibrido"


class Disponibilidad(str, Enum):
    inmediata = "inmediata"
    quince_dias = "15_dias"
    un_mes = "1_mes"
    negociable = "negociable"


# ---------- Request ----------

class PerfilCreate(BaseModel):
    nombre_completo: str = Field(..., min_length=2, max_length=200)
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=8, max_length=100)
    telefono: Optional[str] = Field(None, max_length=30)
    ubicacion: Optional[str] = Field(None, max_length=100)

    resumen_profesional: Optional[str] = None
    nivel_educativo: Optional[NivelEducativo] = None
    titulo_educativo: Optional[str] = Field(None, max_length=200)
    institucion_educativa: Optional[str] = Field(None, max_length=200)
    experiencia_anos: Optional[int] = Field(None, ge=0, le=50)
    cargo_actual: Optional[str] = Field(None, max_length=200)
    empresa_actual: Optional[str] = Field(None, max_length=200)

    skills: Optional[list[str]] = Field(default_factory=list)

    aspiracion_salarial_min: Optional[float] = Field(None, ge=0)
    aspiracion_salarial_max: Optional[float] = Field(None, ge=0)
    modalidad_preferida: Optional[Modalidad] = None
    disponibilidad: Optional[Disponibilidad] = None

    cv_texto: Optional[str] = None


class PerfilUpdate(BaseModel):
    nombre_completo: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[str] = Field(None, min_length=5, max_length=200)
    telefono: Optional[str] = Field(None, max_length=30)
    ubicacion: Optional[str] = Field(None, max_length=100)

    resumen_profesional: Optional[str] = None
    nivel_educativo: Optional[NivelEducativo] = None
    titulo_educativo: Optional[str] = Field(None, max_length=200)
    institucion_educativa: Optional[str] = Field(None, max_length=200)
    experiencia_anos: Optional[int] = Field(None, ge=0, le=50)
    cargo_actual: Optional[str] = Field(None, max_length=200)
    empresa_actual: Optional[str] = Field(None, max_length=200)

    skills: Optional[list[str]] = None

    aspiracion_salarial_min: Optional[float] = Field(None, ge=0)
    aspiracion_salarial_max: Optional[float] = Field(None, ge=0)
    modalidad_preferida: Optional[Modalidad] = None
    disponibilidad: Optional[Disponibilidad] = None

    cv_texto: Optional[str] = None


# ---------- Response ----------

class PerfilResponse(BaseModel):
    id: str
    nombre_completo: str
    email: str
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None

    resumen_profesional: Optional[str] = None
    nivel_educativo: Optional[str] = None
    titulo_educativo: Optional[str] = None
    institucion_educativa: Optional[str] = None
    experiencia_anos: Optional[int] = None
    cargo_actual: Optional[str] = None
    empresa_actual: Optional[str] = None

    skills: list[str] = []

    aspiracion_salarial_min: Optional[float] = None
    aspiracion_salarial_max: Optional[float] = None
    modalidad_preferida: Optional[str] = None
    disponibilidad: Optional[str] = None

    cv_texto: Optional[str] = None

    completitud: float = 0.0

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------- Análisis estructurado del CV ----------

class CVAnalisisEstructurado(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None
    resumen_profesional: Optional[str] = None
    nivel_educativo: Optional[str] = None
    titulo_educativo: Optional[str] = None
    institucion_educativa: Optional[str] = None
    experiencia_anos: Optional[int] = None
    cargo_actual: Optional[str] = None
    empresa_actual: Optional[str] = None
    skills: list[str] = []
    puntos_fuertes: list[str] = []
    puntos_debiles: list[str] = []
    recomendaciones: list[str] = []