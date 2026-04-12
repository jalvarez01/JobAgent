import json
from typing import Optional

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.postulacion import PostulacionModel
from backend.infrastructure.persistence.models.traza import TrazaModel


class PostulacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, perfil_id: str, vacante_id: str, tipo: str = "manual",
               notas: str = None, score_match: str = None) -> PostulacionModel:
        # Verificar si ya existe una postulación activa
        existente = (
            self.db.query(PostulacionModel)
            .filter(
                PostulacionModel.perfil_id == perfil_id,
                PostulacionModel.vacante_id == vacante_id,
                PostulacionModel.estado.notin_(["descartado", "retirado"]),
            )
            .first()
        )
        if existente:
            raise ValueError("Ya existe una postulación activa para esta vacante")

        postulacion = PostulacionModel(
            perfil_id=perfil_id,
            vacante_id=vacante_id,
            tipo=tipo,
            notas=notas,
            score_match=score_match,
        )
        self.db.add(postulacion)

        # Registrar traza
        traza = TrazaModel(
            perfil_id=perfil_id,
            postulacion_id=postulacion.id,
            tipo="postulacion_creada",
            descripcion=f"Postulación creada ({tipo}) a vacante {vacante_id}",
            origen="sistema" if tipo == "auto" else "usuario",
            extra_data=json.dumps({"score_match": score_match}),
        )
        self.db.add(traza)

        self.db.commit()
        self.db.refresh(postulacion)
        return postulacion

    def get_by_id(self, postulacion_id: str) -> Optional[PostulacionModel]:
        return self.db.query(PostulacionModel).filter(PostulacionModel.id == postulacion_id).first()

    def get_by_perfil(self, perfil_id: str) -> list[PostulacionModel]:
        return (
            self.db.query(PostulacionModel)
            .filter(PostulacionModel.perfil_id == perfil_id)
            .order_by(PostulacionModel.updated_at.desc())
            .all()
        )

    def update_estado(self, postulacion_id: str, estado: str, notas: str = None) -> Optional[PostulacionModel]:
        postulacion = self.get_by_id(postulacion_id)
        if not postulacion:
            return None

        estado_anterior = postulacion.estado
        postulacion.estado = estado
        if notas:
            postulacion.notas = notas

        # Registrar traza de cambio de estado
        traza = TrazaModel(
            perfil_id=postulacion.perfil_id,
            postulacion_id=postulacion_id,
            tipo="estado_cambiado",
            descripcion=f"Estado cambiado: {estado_anterior} → {estado}",
            origen="sistema",
            extra_data=json.dumps({"estado_anterior": estado_anterior, "estado_nuevo": estado}),
        )
        self.db.add(traza)

        self.db.commit()
        self.db.refresh(postulacion)
        return postulacion

    def get_trazas(self, perfil_id: str, limit: int = 50) -> list[TrazaModel]:
        return (
            self.db.query(TrazaModel)
            .filter(TrazaModel.perfil_id == perfil_id)
            .order_by(TrazaModel.created_at.desc())
            .limit(limit)
            .all()
        )
