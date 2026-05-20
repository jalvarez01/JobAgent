import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class VacanteModel(Base):
    __tablename__ = "vacantes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    titulo: Mapped[str] = mapped_column(String(300))
    empresa: Mapped[str] = mapped_column(String(200))
    ubicacion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    modalidad: Mapped[str | None] = mapped_column(String(20), nullable=True)
    salario_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    salario_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    requisitos: Mapped[str | None] = mapped_column(Text, nullable=True)  # skills separados por ;
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default="activa")
    area: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)