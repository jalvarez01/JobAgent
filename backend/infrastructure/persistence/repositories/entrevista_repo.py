from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.entrevista import EntrevistaModel


class EntrevistaRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> EntrevistaModel:
        entrevista = EntrevistaModel(**data)
        self.db.add(entrevista)
        self.db.commit()
        self.db.refresh(entrevista)
        return entrevista

    def get_by_id(self, entrevista_id: str) -> Optional[EntrevistaModel]:
        return self.db.query(EntrevistaModel).filter(EntrevistaModel.id == entrevista_id).first()

    def get_by_perfil(self, perfil_id: str) -> list[EntrevistaModel]:
        return (
            self.db.query(EntrevistaModel)
            .filter(EntrevistaModel.perfil_id == perfil_id)
            .order_by(EntrevistaModel.fecha_entrevista.desc())
            .all()
        )

    def get_all(self) -> list[EntrevistaModel]:
        return (
            self.db.query(EntrevistaModel)
            .order_by(EntrevistaModel.fecha_entrevista.desc())
            .all()
        )

    def update(self, entrevista_id: str, data: dict) -> Optional[EntrevistaModel]:
        entrevista = self.get_by_id(entrevista_id)
        if not entrevista:
            return None
        for field, value in data.items():
            if value is not None:
                setattr(entrevista, field, value)
        self.db.commit()
        self.db.refresh(entrevista)
        return entrevista

    def delete(self, entrevista_id: str) -> bool:
        entrevista = self.get_by_id(entrevista_id)
        if not entrevista:
            return False
        self.db.delete(entrevista)
        self.db.commit()
        return True