from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.notificacion import NotificacionModel


class NotificacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, perfil_id: str, tipo: str, titulo: str, mensaje: str,
               postulacion_id: str | None = None, entrevista_id: str | None = None) -> NotificacionModel:
        notif = NotificacionModel(
            perfil_id=perfil_id,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            postulacion_id=postulacion_id,
            entrevista_id=entrevista_id,
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def get_by_perfil(self, perfil_id: str, solo_no_leidas: bool = False) -> list[NotificacionModel]:
        query = self.db.query(NotificacionModel).filter(NotificacionModel.perfil_id == perfil_id)
        if solo_no_leidas:
            query = query.filter(NotificacionModel.leida == False)
        return query.order_by(NotificacionModel.created_at.desc()).all()

    def contar_no_leidas(self, perfil_id: str) -> int:
        return (
            self.db.query(NotificacionModel)
            .filter(NotificacionModel.perfil_id == perfil_id, NotificacionModel.leida == False)
            .count()
        )

    def marcar_leida(self, notificacion_id: str) -> Optional[NotificacionModel]:
        notif = self.db.query(NotificacionModel).filter(NotificacionModel.id == notificacion_id).first()
        if not notif:
            return None
        notif.leida = True
        notif.leida_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def marcar_todas_leidas(self, perfil_id: str) -> int:
        ahora = datetime.now(timezone.utc)
        actualizadas = (
            self.db.query(NotificacionModel)
            .filter(NotificacionModel.perfil_id == perfil_id, NotificacionModel.leida == False)
            .update({"leida": True, "leida_at": ahora})
        )
        self.db.commit()
        return actualizadas

    def eliminar(self, notificacion_id: str) -> bool:
        notif = self.db.query(NotificacionModel).filter(NotificacionModel.id == notificacion_id).first()
        if not notif:
            return False
        self.db.delete(notif)
        self.db.commit()
        return True