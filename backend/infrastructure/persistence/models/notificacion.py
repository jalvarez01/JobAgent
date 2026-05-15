import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class NotificacionModel(Base):
    __tablename__ = "notificaciones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    perfil_id: Mapped[str] = mapped_column(String(36), ForeignKey("perfiles.id"))
    postulacion_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("postulaciones.id"), nullable=True)
    entrevista_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("entrevistas.id"), nullable=True)

    # Tipo de notificacion: cambio_estado, entrevista_programada, entrevista_calificada, sistema
    tipo: Mapped[str] = mapped_column(String(50), default="sistema")

    # Contenido
    titulo: Mapped[str] = mapped_column(String(200))
    mensaje: Mapped[str] = mapped_column(Text)

    # Estado de lectura
    leida: Mapped[bool] = mapped_column(Boolean, default=False)
    leida_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)