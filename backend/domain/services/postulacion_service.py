from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.postulacion_repo import PostulacionRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.domain.services.notificacion_service import NotificacionService
from backend.schemas.postulacion import PostulacionCreate, PostulacionResponse


class PostulacionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PostulacionRepository(db)
        self.vacante_repo = VacanteRepository(db)
        self.perfil_repo = PerfilRepository(db)
        self.notif_service = NotificacionService(db)

    def crear_postulacion(self, data: PostulacionCreate) -> PostulacionResponse:
        # Validar duplicados activos
        existente = self.repo.get_activa_perfil_vacante(data.perfil_id, data.vacante_id)
        if existente:
            raise ValueError("Ya existe una postulación activa para esta vacante")

        postulacion = self.repo.create(data)

        # Crear notificación de postulación creada
        vacante = self.vacante_repo.get_by_id(data.vacante_id)
        if vacante:
            self.notif_service.notificar_cambio_estado(
                perfil_id=data.perfil_id,
                postulacion_id=postulacion.id,
                vacante_titulo=vacante.titulo,
                empresa=vacante.empresa,
                estado_anterior="—",
                estado_nuevo="postulado",
            )

        return self._enriquecer(postulacion)

    def listar_por_perfil(self, perfil_id: str) -> list[PostulacionResponse]:
        postulaciones = self.repo.get_by_perfil(perfil_id)
        return [self._enriquecer(p) for p in postulaciones]

    def cambiar_estado(self, postulacion_id: str, nuevo_estado: str, notas: str | None = None) -> Optional[PostulacionResponse]:
        # Obtener estado anterior antes de cambiar
        postulacion_antes = self.repo.get_by_id(postulacion_id)
        if not postulacion_antes:
            return None
        estado_anterior = postulacion_antes.estado
        perfil_id = postulacion_antes.perfil_id
        vacante_id = postulacion_antes.vacante_id

        # Cambiar estado
        postulacion = self.repo.cambiar_estado(postulacion_id, nuevo_estado, notas)
        if not postulacion:
            return None

        # Si efectivamente cambió, crear notificación
        if estado_anterior != nuevo_estado:
            vacante = self.vacante_repo.get_by_id(vacante_id)
            if vacante:
                self.notif_service.notificar_cambio_estado(
                    perfil_id=perfil_id,
                    postulacion_id=postulacion_id,
                    vacante_titulo=vacante.titulo,
                    empresa=vacante.empresa,
                    estado_anterior=estado_anterior,
                    estado_nuevo=nuevo_estado,
                )

        return self._enriquecer(postulacion)

    def obtener(self, postulacion_id: str) -> Optional[PostulacionResponse]:
        postulacion = self.repo.get_by_id(postulacion_id)
        if not postulacion:
            return None
        return self._enriquecer(postulacion)

    def _enriquecer(self, postulacion) -> PostulacionResponse:
        resp = PostulacionResponse.model_validate(postulacion)
        vacante = self.vacante_repo.get_by_id(postulacion.vacante_id)
        if vacante:
            resp.vacante_titulo = vacante.titulo
            resp.vacante_empresa = vacante.empresa
        return resp