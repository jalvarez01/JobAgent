from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.notificacion_repo import NotificacionRepository
from backend.schemas.notificacion import NotificacionResponse


# Mensajes legibles por estado
ESTADO_MENSAJES = {
    "postulado": "Tu postulación fue registrada",
    "en_revision": "Tu postulación está en revisión",
    "entrevista": "¡Has avanzado a la fase de entrevista!",
    "oferta": "¡Felicidades! Recibiste una oferta",
    "descartado": "Tu postulación no fue seleccionada esta vez",
}


class NotificacionService:
    def __init__(self, db: Session):
        self.repo = NotificacionRepository(db)

    def listar_por_perfil(self, perfil_id: str, solo_no_leidas: bool = False) -> list[NotificacionResponse]:
        notifs = self.repo.get_by_perfil(perfil_id, solo_no_leidas)
        return [NotificacionResponse.model_validate(n) for n in notifs]

    def contar_no_leidas(self, perfil_id: str) -> int:
        return self.repo.contar_no_leidas(perfil_id)

    def marcar_leida(self, notificacion_id: str) -> NotificacionResponse | None:
        notif = self.repo.marcar_leida(notificacion_id)
        if not notif:
            return None
        return NotificacionResponse.model_validate(notif)

    def marcar_todas_leidas(self, perfil_id: str) -> int:
        return self.repo.marcar_todas_leidas(perfil_id)

    def eliminar(self, notificacion_id: str) -> bool:
        return self.repo.eliminar(notificacion_id)

    # ─── Helpers para crear notificaciones desde otros servicios ───

    def notificar_cambio_estado(self, perfil_id: str, postulacion_id: str,
                                 vacante_titulo: str, empresa: str,
                                 estado_anterior: str, estado_nuevo: str) -> NotificacionResponse:
        mensaje_estado = ESTADO_MENSAJES.get(estado_nuevo, f"Estado cambiado a {estado_nuevo}")
        titulo = f"Actualización: {vacante_titulo}"
        mensaje = (
            f"{mensaje_estado}. La vacante en {empresa} pasó de "
            f"'{estado_anterior}' a '{estado_nuevo}'."
        )
        notif = self.repo.create(
            perfil_id=perfil_id,
            tipo="cambio_estado",
            titulo=titulo,
            mensaje=mensaje,
            postulacion_id=postulacion_id,
        )
        return NotificacionResponse.model_validate(notif)

    def notificar_entrevista_programada(self, perfil_id: str, entrevista_id: str,
                                         vacante_titulo: str | None,
                                         empresa: str | None, fecha: str | None) -> NotificacionResponse:
        contexto = f" para {vacante_titulo} en {empresa}" if vacante_titulo else ""
        cuando = f" el {fecha}" if fecha else ""
        notif = self.repo.create(
            perfil_id=perfil_id,
            tipo="entrevista_programada",
            titulo="Entrevista programada",
            mensaje=f"Se programó una nueva entrevista{contexto}{cuando}.",
            entrevista_id=entrevista_id,
        )
        return NotificacionResponse.model_validate(notif)

    def notificar_entrevista_calificada(self, perfil_id: str, entrevista_id: str,
                                         puntaje: int, vacante_titulo: str | None) -> NotificacionResponse:
        contexto = f" de {vacante_titulo}" if vacante_titulo else ""
        notif = self.repo.create(
            perfil_id=perfil_id,
            tipo="entrevista_calificada",
            titulo="Tu entrevista fue calificada",
            mensaje=f"Recibiste un puntaje de {puntaje}/100 en tu entrevista{contexto}. Revisa el informe completo.",
            entrevista_id=entrevista_id,
        )
        return NotificacionResponse.model_validate(notif)