import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class FavoritoModel(Base):
    __tablename__ = "favoritos"
    __table_args__ = (
        UniqueConstraint("perfil_id", "vacante_id", name="uq_favorito_perfil_vacante"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    perfil_id: Mapped[str] = mapped_column(String(36), ForeignKey("perfiles.id"))
    vacante_id: Mapped[str] = mapped_column(String(36), ForeignKey("vacantes.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)