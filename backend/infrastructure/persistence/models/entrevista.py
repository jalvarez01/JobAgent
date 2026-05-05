import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class EntrevistaModel(Base):
    __tablename__ = "entrevistas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    perfil_id: Mapped[str] = mapped_column(String(36), ForeignKey("perfiles.id"))
    vacante_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("vacantes.id"), nullable=True)
    postulacion_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("postulaciones.id"), nullable=True)

    # Detalles de la entrevista
    fecha_entrevista: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    tipo: Mapped[str] = mapped_column(String(30), default="tecnica")  # tecnica / hr / final / cultural
    entrevistador: Mapped[str | None] = mapped_column(String(200), nullable=True)
    duracion_minutos: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Resultados (solo el admin los modifica)
    puntaje: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0-100
    nivel: Mapped[str | None] = mapped_column(String(30), nullable=True)  # excelente / bueno / regular / debil
    estado: Mapped[str] = mapped_column(String(30), default="programada")  # programada / completada / cancelada

    # Feedback y análisis
    fortalezas: Mapped[str | None] = mapped_column(Text, nullable=True)
    debilidades: Mapped[str | None] = mapped_column(Text, nullable=True)
    recomendaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    notas_admin: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)