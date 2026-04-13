from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.perfil import PerfilModel
from backend.schemas.cv import PerfilCreate, PerfilUpdate


class PerfilRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: PerfilCreate) -> PerfilModel:
        data_dict = data.model_dump(exclude_none=False)
        data_dict.pop("password", None)  # No guardar password plano
        perfil = PerfilModel(**data_dict)
        self.db.add(perfil)
        self.db.commit()
        self.db.refresh(perfil)
        return perfil

    def create_from_dict(self, data: dict) -> PerfilModel:
        """Crea perfil desde dict (usado por el servicio cuando ya hasheó el password)."""
        perfil = PerfilModel(**data)
        self.db.add(perfil)
        self.db.commit()
        self.db.refresh(perfil)
        return perfil

    def get_by_id(self, perfil_id: str) -> Optional[PerfilModel]:
        return self.db.query(PerfilModel).filter(PerfilModel.id == perfil_id).first()

    def get_by_email(self, email: str) -> Optional[PerfilModel]:
        return self.db.query(PerfilModel).filter(PerfilModel.email == email).first()

    def get_all(self) -> list[PerfilModel]:
        return self.db.query(PerfilModel).all()

    def update(self, perfil_id: str, data: PerfilUpdate) -> Optional[PerfilModel]:
        perfil = self.get_by_id(perfil_id)
        if not perfil:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(perfil, field, value)

        self.db.commit()
        self.db.refresh(perfil)
        return perfil

    def delete(self, perfil_id: str) -> bool:
        perfil = self.get_by_id(perfil_id)
        if not perfil:
            return False
        self.db.delete(perfil)
        self.db.commit()
        return True