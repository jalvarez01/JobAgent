from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.favorito_repo import FavoritoRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.schemas.favorito import FavoritoResponse


class FavoritoService:
    def __init__(self, db: Session):
        self.repo = FavoritoRepository(db)
        self.vacante_repo = VacanteRepository(db)

    def guardar_favorito(self, perfil_id: str, vacante_id: str) -> tuple[FavoritoResponse, bool]:
        """Guarda un favorito. Retorna (favorito, es_nuevo). Si ya existe, retorna el existente."""
        ya_existia = self.repo.is_favorito(perfil_id, vacante_id)
        favorito = self.repo.create(perfil_id, vacante_id)
        return self._enriquecer(favorito), not ya_existia

    def listar_favoritos(self, perfil_id: str) -> list[FavoritoResponse]:
        favoritos = self.repo.get_by_perfil(perfil_id)
        return [self._enriquecer(f) for f in favoritos]

    def eliminar_favorito(self, perfil_id: str, vacante_id: str) -> bool:
        return self.repo.delete(perfil_id, vacante_id)

    def es_favorito(self, perfil_id: str, vacante_id: str) -> bool:
        return self.repo.is_favorito(perfil_id, vacante_id)

    def _enriquecer(self, favorito) -> FavoritoResponse:
        resp = FavoritoResponse.model_validate(favorito)
        vacante = self.vacante_repo.get_by_id(favorito.vacante_id)
        if vacante:
            resp.vacante_titulo = vacante.titulo
            resp.vacante_empresa = vacante.empresa
            resp.vacante_ubicacion = vacante.ubicacion
            resp.vacante_modalidad = vacante.modalidad
            resp.vacante_salario_min = vacante.salario_min
            resp.vacante_salario_max = vacante.salario_max
        return resp