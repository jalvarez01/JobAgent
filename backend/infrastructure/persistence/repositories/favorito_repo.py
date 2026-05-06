from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.favorito import FavoritoModel


class FavoritoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_perfil_y_vacante(self, perfil_id: str, vacante_id: str) -> Optional[FavoritoModel]:
        return (
            self.db.query(FavoritoModel)
            .filter(
                FavoritoModel.perfil_id == perfil_id,
                FavoritoModel.vacante_id == vacante_id,
            )
            .first()
        )

    def create(self, perfil_id: str, vacante_id: str) -> FavoritoModel:
        existente = self.get_by_perfil_y_vacante(perfil_id, vacante_id)
        if existente:
            return existente

        favorito = FavoritoModel(perfil_id=perfil_id, vacante_id=vacante_id)
        self.db.add(favorito)
        self.db.commit()
        self.db.refresh(favorito)
        return favorito

    def get_by_perfil(self, perfil_id: str) -> list[FavoritoModel]:
        return (
            self.db.query(FavoritoModel)
            .filter(FavoritoModel.perfil_id == perfil_id)
            .order_by(FavoritoModel.created_at.desc())
            .all()
        )

    def delete(self, perfil_id: str, vacante_id: str) -> bool:
        favorito = self.get_by_perfil_y_vacante(perfil_id, vacante_id)
        if not favorito:
            return False
        self.db.delete(favorito)
        self.db.commit()
        return True

    def is_favorito(self, perfil_id: str, vacante_id: str) -> bool:
        return self.get_by_perfil_y_vacante(perfil_id, vacante_id) is not None