from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.database import get_db
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.domain.services.recomendacion_service import RecomendacionService
from backend.schemas.vacante import VacanteResponse, VacanteConScore, VacanteCreate, VacanteUpdate

router = APIRouter()


@router.get("/", response_model=list[VacanteResponse])
def listar_vacantes(
    q: Optional[str] = Query(None, description="Búsqueda por título, empresa o requisitos"),
    todas: bool = Query(False, description="Incluir inactivas (admin)"),
    db: Session = Depends(get_db),
):
    repo = VacanteRepository(db)
    if todas:
        return repo.get_all_any_estado()
    if q:
        return repo.search(q)
    return repo.get_all()


@router.post("/", response_model=VacanteResponse, status_code=201)
def crear_vacante(data: VacanteCreate, db: Session = Depends(get_db)):
    repo = VacanteRepository(db)
    vacante = repo.create(data.model_dump())
    return vacante


# IMPORTANTE: rutas con prefijo fijo van ANTES de /{vacante_id}
@router.get("/recomendaciones/{perfil_id}", response_model=list[VacanteConScore])
def recomendaciones(
    perfil_id: str,
    limit: int = Query(10, ge=1, le=50),
    modalidad: Optional[str] = Query(None),
    ubicacion: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    svc = RecomendacionService(db)
    resultados = svc.recomendar_para_perfil(
        perfil_id=perfil_id,
        limit=limit,
        modalidad=modalidad,
        ubicacion=ubicacion,
    )
    if not resultados:
        return []
    return resultados


@router.get("/{vacante_id}", response_model=VacanteResponse)
def obtener_vacante(vacante_id: str, db: Session = Depends(get_db)):
    repo = VacanteRepository(db)
    vacante = repo.get_by_id(vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put("/{vacante_id}", response_model=VacanteResponse)
def actualizar_vacante(vacante_id: str, data: VacanteUpdate, db: Session = Depends(get_db)):
    repo = VacanteRepository(db)
    vacante = repo.update(vacante_id, data.model_dump(exclude_unset=True))
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.delete("/{vacante_id}", status_code=204)
def eliminar_vacante(vacante_id: str, db: Session = Depends(get_db)):
    repo = VacanteRepository(db)
    eliminada = repo.delete(vacante_id)
    if not eliminada:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")