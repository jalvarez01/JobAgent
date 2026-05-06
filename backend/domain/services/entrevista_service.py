from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.entrevista_repo import EntrevistaRepository
from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.schemas.entrevista import EntrevistaCreate, EntrevistaUpdate, EntrevistaResponse


def _calcular_nivel(puntaje: int | None) -> str | None:
    """Calcula el nivel automaticamente segun el puntaje."""
    if puntaje is None:
        return None
    if puntaje >= 85:
        return "excelente"
    if puntaje >= 70:
        return "bueno"
    if puntaje >= 50:
        return "regular"
    return "debil"


def _calcular_puntaje_promedio(data: dict) -> int | None:
    """
    Calcula el puntaje total como promedio de los sub-puntajes.
    Solo usa los que están definidos (no None).
    """
    sub_puntajes = [
        data.get("puntaje_tecnico"),
        data.get("puntaje_comunicacion"),
        data.get("puntaje_conocimientos"),
        data.get("puntaje_actitud"),
    ]
    validos = [p for p in sub_puntajes if p is not None]
    if not validos:
        return None
    return round(sum(validos) / len(validos))


class EntrevistaService:
    def __init__(self, db: Session):
        self.repo = EntrevistaRepository(db)
        self.perfil_repo = PerfilRepository(db)
        self.vacante_repo = VacanteRepository(db)

    def crear_entrevista(self, data: EntrevistaCreate) -> EntrevistaResponse:
        payload = data.model_dump(exclude_none=False)
        entrevista = self.repo.create(payload)
        return self._enriquecer(entrevista)

    def listar_por_perfil(self, perfil_id: str) -> list[EntrevistaResponse]:
        entrevistas = self.repo.get_by_perfil(perfil_id)
        return [self._enriquecer(e) for e in entrevistas]

    def listar_todas(self) -> list[EntrevistaResponse]:
        entrevistas = self.repo.get_all()
        return [self._enriquecer(e) for e in entrevistas]

    def obtener(self, entrevista_id: str) -> Optional[EntrevistaResponse]:
        entrevista = self.repo.get_by_id(entrevista_id)
        if not entrevista:
            return None
        return self._enriquecer(entrevista)

    def actualizar(self, entrevista_id: str, data: EntrevistaUpdate) -> Optional[EntrevistaResponse]:
        update_data = data.model_dump(exclude_unset=True)

        # Si se enviaron sub-puntajes, recalcular el puntaje total como promedio
        sub_keys = ["puntaje_tecnico", "puntaje_comunicacion", "puntaje_conocimientos", "puntaje_actitud"]
        if any(k in update_data for k in sub_keys):
            # Combinar sub-puntajes existentes con los nuevos
            entrevista_actual = self.repo.get_by_id(entrevista_id)
            if entrevista_actual:
                merged = {
                    "puntaje_tecnico": update_data.get("puntaje_tecnico", entrevista_actual.puntaje_tecnico),
                    "puntaje_comunicacion": update_data.get("puntaje_comunicacion", entrevista_actual.puntaje_comunicacion),
                    "puntaje_conocimientos": update_data.get("puntaje_conocimientos", entrevista_actual.puntaje_conocimientos),
                    "puntaje_actitud": update_data.get("puntaje_actitud", entrevista_actual.puntaje_actitud),
                }
                puntaje_calculado = _calcular_puntaje_promedio(merged)
                if puntaje_calculado is not None:
                    update_data["puntaje"] = puntaje_calculado
                    update_data["nivel"] = _calcular_nivel(puntaje_calculado)
        # Si se envió puntaje manual sin sub-puntajes, calcular nivel
        elif "puntaje" in update_data and update_data["puntaje"] is not None:
            update_data["nivel"] = _calcular_nivel(update_data["puntaje"])

        entrevista = self.repo.update(entrevista_id, update_data)
        if not entrevista:
            return None
        return self._enriquecer(entrevista)

    def eliminar(self, entrevista_id: str) -> bool:
        return self.repo.delete(entrevista_id)

    def _enriquecer(self, entrevista) -> EntrevistaResponse:
        resp = EntrevistaResponse.model_validate(entrevista)
        perfil = self.perfil_repo.get_by_id(entrevista.perfil_id)
        if perfil:
            resp.perfil_nombre = perfil.nombre_completo
            resp.perfil_email = perfil.email
        if entrevista.vacante_id:
            vacante = self.vacante_repo.get_by_id(entrevista.vacante_id)
            if vacante:
                resp.vacante_titulo = vacante.titulo
                resp.vacante_empresa = vacante.empresa
        return resp