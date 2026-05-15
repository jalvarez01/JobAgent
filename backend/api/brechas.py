from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.brechas_service import BrechasService
from backend.infrastructure.persistence.repositories.skill_aprendizaje_repo import (
    SkillAprendizajeRepository,
)

router = APIRouter()


class SkillAprendizajeRequest(BaseModel):
    skill: str


@router.get("/{perfil_id}")
def analizar_brechas(perfil_id: str, db: Session = Depends(get_db)):
    """Analiza qué skills demandados por el mercado le faltan al usuario."""
    try:
        svc = BrechasService(db)
        return svc.analizar(perfil_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{perfil_id}/aprendizaje")
def listar_skills_aprendizaje(perfil_id: str, db: Session = Depends(get_db)):
    """Skills que el usuario marcó como 'en proceso de aprendizaje'."""
    repo = SkillAprendizajeRepository(db)
    items = repo.listar(perfil_id)
    return [
        {"id": i.id, "skill": i.skill, "created_at": i.created_at}
        for i in items
    ]


@router.post("/{perfil_id}/aprendizaje", status_code=201)
def agregar_skill_aprendizaje(
    perfil_id: str,
    data: SkillAprendizajeRequest,
    db: Session = Depends(get_db),
):
    """Marca un skill como 'en proceso de aprendizaje' para el usuario."""
    try:
        repo = SkillAprendizajeRepository(db)
        record = repo.agregar(perfil_id, data.skill)
        return {"id": record.id, "skill": record.skill, "created_at": record.created_at}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{perfil_id}/aprendizaje/{skill}")
def eliminar_skill_aprendizaje(
    perfil_id: str,
    skill: str,
    db: Session = Depends(get_db),
):
    """Quita un skill del listado 'en proceso de aprendizaje'."""
    repo = SkillAprendizajeRepository(db)
    eliminado = repo.eliminar(perfil_id, skill)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Skill no estaba marcado como en aprendizaje")
    return {"eliminado": True}