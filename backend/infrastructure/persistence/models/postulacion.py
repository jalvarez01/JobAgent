import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class PostulacionModel(Base):
    __tablename__ = "postulaciones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    perfil_id: Mapped[str] = mapped_column(String(36), ForeignKey("perfiles.id"))
    vacante_id: Mapped[str] = mapped_column(String(36), ForeignKey("vacantes.id"))

    # Estado del proceso: postulado | en_revision | entrevista | oferta | descartado | retirado
    estado: Mapped[str] = mapped_column(String(30), default="postulado")

    # Quién inició la postulación: manual | auto | asistida
    tipo: Mapped[str] = mapped_column(String(20), default="manual")

    # Notas del sistema o del candidato
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Score de match al momento de postular (snapshot)
    score_match: Mapped[str | None] = mapped_column(String(10), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
