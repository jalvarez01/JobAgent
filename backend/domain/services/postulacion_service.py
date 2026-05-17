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
        postulacion = self.repo.create(
            perfil_id=data.perfil_id,
            vacante_id=data.vacante_id,
            tipo=data.tipo or "manual",
            notas=data.notas,
            score_match=data.score_match,
            carta_presentacion=data.carta_presentacion,
        )

        vacante = self.vacante_repo.get_by_id(data.vacante_id)
        if vacante:
            try:
                self.notif_service.notificar_cambio_estado(
                    perfil_id=data.perfil_id,
                    postulacion_id=postulacion.id,
                    vacante_titulo=vacante.titulo,
                    empresa=vacante.empresa,
                    estado_anterior="—",
                    estado_nuevo="postulado",
                )
            except Exception as e:
                print(f"[warning] No se pudo crear notificación: {e}")

        return self._enriquecer(postulacion)

    def listar_por_perfil(self, perfil_id: str) -> list[PostulacionResponse]:
        postulaciones = self.repo.get_by_perfil(perfil_id)
        return [self._enriquecer(p) for p in postulaciones]

    def listar_todas(self) -> list[PostulacionResponse]:
        postulaciones = self.repo.get_all()
        return [self._enriquecer_con_perfil(p) for p in postulaciones]

    def cambiar_estado(self, postulacion_id: str, nuevo_estado: str, notas: str | None = None) -> Optional[PostulacionResponse]:
        postulacion_antes = self.repo.get_by_id(postulacion_id)
        if not postulacion_antes:
            return None
        estado_anterior = postulacion_antes.estado
        perfil_id = postulacion_antes.perfil_id
        vacante_id = postulacion_antes.vacante_id

        postulacion = self.repo.update_estado(postulacion_id, nuevo_estado, notas)
        if not postulacion:
            return None

        if estado_anterior != nuevo_estado:
            vacante = self.vacante_repo.get_by_id(vacante_id)
            if vacante:
                try:
                    self.notif_service.notificar_cambio_estado(
                        perfil_id=perfil_id,
                        postulacion_id=postulacion_id,
                        vacante_titulo=vacante.titulo,
                        empresa=vacante.empresa,
                        estado_anterior=estado_anterior,
                        estado_nuevo=nuevo_estado,
                    )
                except Exception as e:
                    print(f"[warning] No se pudo crear notificación: {e}")

        return self._enriquecer(postulacion)

    def obtener(self, postulacion_id: str) -> Optional[PostulacionResponse]:
        postulacion = self.repo.get_by_id(postulacion_id)
        if not postulacion:
            return None
        return self._enriquecer(postulacion)

    def obtener_trazas(self, perfil_id: str, limit: int = 50):
        return self.repo.get_trazas(perfil_id, limit)

    def _enriquecer(self, postulacion) -> PostulacionResponse:
        resp = PostulacionResponse.model_validate(postulacion)
        vacante = self.vacante_repo.get_by_id(postulacion.vacante_id)
        if vacante:
            resp.vacante_titulo = vacante.titulo
            resp.vacante_empresa = vacante.empresa
        return resp

    def _enriquecer_con_perfil(self, postulacion) -> PostulacionResponse:
        resp = self._enriquecer(postulacion)
        perfil = self.perfil_repo.get_by_id(postulacion.perfil_id)
        if perfil:
            setattr(resp, "perfil_nombre", perfil.nombre_completo)
            setattr(resp, "perfil_email", perfil.email)
        return resp