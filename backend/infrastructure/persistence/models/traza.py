import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class TrazaModel(Base):
    __tablename__ = "trazas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    perfil_id: Mapped[str] = mapped_column(String(36))
    postulacion_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Tipo de evento: cv_subido | cv_analizado | perfil_creado | perfil_actualizado |
    #   vacante_recomendada | postulacion_creada | estado_cambiado | agente_accion
    tipo: Mapped[str] = mapped_column(String(50))

    # Descripción legible del evento
    descripcion: Mapped[str] = mapped_column(Text)

    # Quién generó el evento: usuario | sistema | agente_perfil | agente_vacantes | agente_postulacion | agente_seguimiento
    origen: Mapped[str] = mapped_column(String(30), default="sistema")

    # Metadata extra (JSON como string)
    extra_data: Mapped[str | None] = mapped_column("metadata", Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
