from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.postulacion_repo import PostulacionRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.schemas.postulacion import PostulacionCreate, PostulacionResponse
from backend.schemas.traza import TrazaResponse


ESTADOS_VALIDOS = {"postulado", "en_revision", "entrevista", "oferta", "descartado", "retirado"}


class PostulacionService:
    def __init__(self, db: Session):
        self.repo = PostulacionRepository(db)
        self.vacante_repo = VacanteRepository(db)

    def postular(self, data: PostulacionCreate) -> PostulacionResponse:
        postulacion = self.repo.create(
            perfil_id=data.perfil_id,
            vacante_id=data.vacante_id,
            tipo=data.tipo,
            notas=data.notas,
            score_match=data.score_match,
        )
        return self._enriquecer(postulacion)

    def listar_por_perfil(self, perfil_id: str) -> list[PostulacionResponse]:
        postulaciones = self.repo.get_by_perfil(perfil_id)
        return [self._enriquecer(p) for p in postulaciones]

    def cambiar_estado(self, postulacion_id: str, estado: str, notas: str = None) -> Optional[PostulacionResponse]:
        if estado not in ESTADOS_VALIDOS:
            raise ValueError(f"Estado inválido. Válidos: {', '.join(sorted(ESTADOS_VALIDOS))}")

        postulacion = self.repo.update_estado(postulacion_id, estado, notas)
        if not postulacion:
            return None
        return self._enriquecer(postulacion)

    def obtener_trazas(self, perfil_id: str, limit: int = 50) -> list[TrazaResponse]:
        trazas = self.repo.get_trazas(perfil_id, limit)
        return [TrazaResponse.model_validate(t) for t in trazas]

    def _enriquecer(self, postulacion) -> PostulacionResponse:
        resp = PostulacionResponse.model_validate(postulacion)
        vacante = self.vacante_repo.get_by_id(postulacion.vacante_id)
        if vacante:
            resp.vacante_titulo = vacante.titulo
            resp.vacante_empresa = vacante.empresa
        return resp
