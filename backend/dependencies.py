"""
Inyección de dependencias centralizada.
Se usa get_db desde database.py directamente en los routers.
Este módulo queda disponible para dependencias futuras (auth, rate limiting, etc.).
"""

from backend.infrastructure.persistence.database import get_db

__all__ = ["get_db"]
