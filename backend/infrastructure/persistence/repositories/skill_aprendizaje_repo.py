from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.skill_aprendizaje import SkillAprendizajeModel


def _normalizar(skill: str) -> str:
    return (skill or "").strip().lower()


class SkillAprendizajeRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self, perfil_id: str) -> list[SkillAprendizajeModel]:
        return (
            self.db.query(SkillAprendizajeModel)
            .filter(SkillAprendizajeModel.perfil_id == perfil_id)
            .order_by(SkillAprendizajeModel.created_at.desc())
            .all()
        )

    def agregar(self, perfil_id: str, skill: str) -> SkillAprendizajeModel:
        skill_norm = _normalizar(skill)
        if not skill_norm:
            raise ValueError("El skill no puede estar vacío")

        existente = (
            self.db.query(SkillAprendizajeModel)
            .filter(
                SkillAprendizajeModel.perfil_id == perfil_id,
                SkillAprendizajeModel.skill == skill_norm,
            )
            .first()
        )
        if existente:
            return existente

        record = SkillAprendizajeModel(perfil_id=perfil_id, skill=skill_norm)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def eliminar(self, perfil_id: str, skill: str) -> bool:
        skill_norm = _normalizar(skill)
        record = (
            self.db.query(SkillAprendizajeModel)
            .filter(
                SkillAprendizajeModel.perfil_id == perfil_id,
                SkillAprendizajeModel.skill == skill_norm,
            )
            .first()
        )
        if not record:
            return False
        self.db.delete(record)
        self.db.commit()
        return True