from datetime import datetime
import uuid

from sqlalchemy import Column, String, DateTime

from backend.infrastructure.persistence.database import Base


class PasswordResetTokenModel(Base):
    """Token temporal para recuperación de contraseña.

    Se elimina o invalida automáticamente al ser usado o al expirar.
    """
    __tablename__ = "password_reset_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    perfil_id = Column(String, nullable=False, index=True)
    token = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_at = Column(DateTime, nullable=True)