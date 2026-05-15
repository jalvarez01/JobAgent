import hashlib
import re
import secrets

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.infrastructure.persistence.repositories.password_reset_repo import PasswordResetRepository


def _hash_password(password: str, salt: str) -> str:
    """Hash SHA-256 con salt para almacenamiento seguro."""
    return hashlib.sha256((password + salt).encode()).hexdigest()


def _generate_salt() -> str:
    return secrets.token_hex(16)


def _validar_password(password: str) -> str | None:
    """Devuelve None si la contraseña cumple los requisitos, o un mensaje de error."""
    if not password or len(password) < 8:
        return "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r"[A-Z]", password):
        return "La contraseña debe tener al menos una letra mayúscula"
    if not re.search(r"[a-z]", password):
        return "La contraseña debe tener al menos una letra minúscula"
    return None


class PasswordResetService:
    def __init__(self, db: Session):
        self.db = db
        self.perfil_repo = PerfilRepository(db)
        self.reset_repo = PasswordResetRepository(db)

    def solicitar_recuperacion(self, email: str) -> dict:
        """Genera un token de recuperación para el email indicado.

        Devuelve siempre éxito (incluso si el email no existe) para no filtrar
        información sobre qué emails están registrados. Sin embargo, en este MVP
        académico, retornamos el token solo si el email existe.
        """
        perfil = self.perfil_repo.get_by_email(email)
        if not perfil:
            # Por seguridad no decimos si el email existe, pero retornamos algo válido
            return {
                "mensaje": "Si el email existe en el sistema, recibirás un enlace de recuperación.",
                "token": None,
            }

        token_record = self.reset_repo.create_token(perfil.id, hours=1)
        return {
            "mensaje": "Enlace de recuperación generado correctamente.",
            "token": token_record.token,
        }

    def validar_token(self, token: str) -> dict:
        """Verifica que el token sea válido. Devuelve el email asociado si lo es."""
        record = self.reset_repo.get_valid_token(token)
        if not record:
            return {"valido": False, "email": None}

        perfil = self.perfil_repo.get_by_id(record.perfil_id)
        if not perfil:
            return {"valido": False, "email": None}

        return {"valido": True, "email": perfil.email}

    def cambiar_password(self, token: str, nueva_password: str) -> dict:
        """Cambia la contraseña usando un token válido. Invalida el token tras el uso."""
        error_validacion = _validar_password(nueva_password)
        if error_validacion:
            raise ValueError(error_validacion)

        record = self.reset_repo.get_valid_token(token)
        if not record:
            raise ValueError("El enlace de recuperación es inválido o ha expirado")

        perfil = self.perfil_repo.get_by_id(record.perfil_id)
        if not perfil:
            raise ValueError("El usuario asociado al enlace no existe")

        # Generar nuevo salt y hashear la nueva contraseña
        nuevo_salt = _generate_salt()
        nuevo_hash = _hash_password(nueva_password, nuevo_salt)

        perfil.password_hash = nuevo_hash
        perfil.salt = nuevo_salt
        self.db.commit()

        self.reset_repo.mark_used(record.id)

        return {"mensaje": "Contraseña actualizada correctamente"}