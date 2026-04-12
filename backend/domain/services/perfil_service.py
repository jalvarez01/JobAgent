from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.schemas.cv import PerfilCreate, PerfilUpdate, PerfilResponse


# Campos que contribuyen a la completitud del perfil
_CAMPOS_COMPLETITUD = [
    "nombre_completo", "email", "telefono", "ubicacion",
    "resumen_profesional", "nivel_educativo", "titulo_educativo",
    "institucion_educativa", "experiencia_anos", "cargo_actual",
    "skills", "aspiracion_salarial_min", "modalidad_preferida",
    "disponibilidad",
]


def _calcular_completitud(perfil) -> float:
    """Calcula el porcentaje de completitud del perfil (0.0 a 100.0)."""
    total = len(_CAMPOS_COMPLETITUD)
    llenos = 0
    for campo in _CAMPOS_COMPLETITUD:
        valor = getattr(perfil, campo, None)
        if valor is not None and valor != "" and valor != []:
            llenos += 1
    return round((llenos / total) * 100, 1)


class PerfilService:
    def __init__(self, db: Session):
        self.repo = PerfilRepository(db)

    def crear_perfil(self, data: PerfilCreate) -> PerfilResponse:
        existente = self.repo.get_by_email(data.email)
        if existente:
            raise ValueError(f"Ya existe un perfil con el email {data.email}")

        perfil = self.repo.create(data)
        return self._to_response(perfil)

    def obtener_perfil(self, perfil_id: str) -> Optional[PerfilResponse]:
        perfil = self.repo.get_by_id(perfil_id)
        if not perfil:
            return None
        return self._to_response(perfil)

    def obtener_por_email(self, email: str) -> Optional[PerfilResponse]:
        perfil = self.repo.get_by_email(email)
        if not perfil:
            return None
        return self._to_response(perfil)

    def listar_perfiles(self) -> list[PerfilResponse]:
        perfiles = self.repo.get_all()
        return [self._to_response(p) for p in perfiles]

    def actualizar_perfil(self, perfil_id: str, data: PerfilUpdate) -> Optional[PerfilResponse]:
        perfil = self.repo.update(perfil_id, data)
        if not perfil:
            return None
        return self._to_response(perfil)

    def eliminar_perfil(self, perfil_id: str) -> bool:
        return self.repo.delete(perfil_id)

    def _to_response(self, perfil) -> PerfilResponse:
        resp = PerfilResponse.model_validate(perfil)
        resp.completitud = _calcular_completitud(perfil)
        return resp
