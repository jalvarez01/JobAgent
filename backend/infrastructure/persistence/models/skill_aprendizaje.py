from datetime import datetime
import uuid

from sqlalchemy import Column, String, DateTime, UniqueConstraint

from backend.infrastructure.persistence.database import Base


class SkillAprendizajeModel(Base):
    """Skill que un usuario marcó como 'en proceso de aprendizaje'."""
    __tablename__ = "skills_aprendizaje"
    __table_args__ = (
        UniqueConstraint("perfil_id", "skill", name="uq_perfil_skill_aprendizaje"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    perfil_id = Column(String, nullable=False, index=True)
    skill = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)