from datetime import datetime, timedelta
from typing import Optional
import secrets

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.password_reset_token import PasswordResetTokenModel


class PasswordResetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_token(self, perfil_id: str, hours: int = 1) -> PasswordResetTokenModel:
        """Crea un nuevo token de recuperación e invalida los anteriores del mismo perfil."""
        # Invalidar tokens anteriores del mismo perfil
        self.db.query(PasswordResetTokenModel).filter(
            PasswordResetTokenModel.perfil_id == perfil_id,
            PasswordResetTokenModel.used_at.is_(None),
        ).update({"used_at": datetime.utcnow()})

        token_str = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=hours)

        record = PasswordResetTokenModel(
            perfil_id=perfil_id,
            token=token_str,
            expires_at=expires_at,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_valid_token(self, token: str) -> Optional[PasswordResetTokenModel]:
        """Devuelve el token solo si existe, no ha sido usado y no ha expirado."""
        return (
            self.db.query(PasswordResetTokenModel)
            .filter(
                PasswordResetTokenModel.token == token,
                PasswordResetTokenModel.used_at.is_(None),
                PasswordResetTokenModel.expires_at > datetime.utcnow(),
            )
            .first()
        )

    def mark_used(self, token_id: str) -> None:
        record = (
            self.db.query(PasswordResetTokenModel)
            .filter(PasswordResetTokenModel.id == token_id)
            .first()
        )
        if record:
            record.used_at = datetime.utcnow()
            self.db.commit()