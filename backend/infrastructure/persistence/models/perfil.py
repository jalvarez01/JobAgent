import uuid
import hashlib
import secrets
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """Genera hash seguro de la contraseña con salt."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verifica la contraseña contra el hash almacenado."""
    if ":" not in stored_hash:
        return False
    salt, hashed = stored_hash.split(":", 1)
    check = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return check == hashed


class PerfilModel(Base):
    __tablename__ = "perfiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Datos personales
    nombre_completo: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    ubicacion: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Autenticación
    password_hash: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Perfil profesional
    resumen_profesional: Mapped[str | None] = mapped_column(Text, nullable=True)
    nivel_educativo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    titulo_educativo: Mapped[str | None] = mapped_column(String(200), nullable=True)
    institucion_educativa: Mapped[str | None] = mapped_column(String(200), nullable=True)
    experiencia_anos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cargo_actual: Mapped[str | None] = mapped_column(String(200), nullable=True)
    empresa_actual: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Skills como lista JSON
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)

    # Preferencias laborales
    aspiracion_salarial_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    aspiracion_salarial_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    modalidad_preferida: Mapped[str | None] = mapped_column(String(20), nullable=True)
    disponibilidad: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # CV crudo
    cv_texto: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)