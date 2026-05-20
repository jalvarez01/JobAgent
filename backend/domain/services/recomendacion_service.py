from typing import Optional
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.schemas.vacante import VacanteConScore


def _normalize(skills: list[str] | str | None) -> set[str]:
    """Normaliza skills a un set de strings en minúscula."""
    if not skills:
        return set()
    if isinstance(skills, str):
        return {s.strip().lower() for s in skills.split(";") if s.strip()}
    return {s.strip().lower() for s in skills if s and s.strip()}


class RecomendacionService:
    def __init__(self, db: Session):
        self.perfil_repo = PerfilRepository(db)
        self.vacante_repo = VacanteRepository(db)

    def recomendar_para_perfil(
        self,
        perfil_id: str,
        limit: int = 10,
        modalidad: Optional[str] = None,
        ubicacion: Optional[str] = None,
        area: Optional[str] = None,
    ) -> list[VacanteConScore]:
        perfil = self.perfil_repo.get_by_id(perfil_id)
        if not perfil:
            return []

        perfil_skills = _normalize(perfil.skills or [])
        if not perfil_skills:
            return []

        # Filtramos por área directamente en el repo (más eficiente)
        vacantes = self.vacante_repo.get_all(estado="activa", area=area)

        scored = []
        for v in vacantes:
            # Filtro por modalidad si se especifica
            if modalidad and v.modalidad and v.modalidad.lower() != modalidad.lower():
                continue
            # Filtro por ubicación si se especifica
            if ubicacion and v.ubicacion and ubicacion.lower() not in v.ubicacion.lower():
                continue

            vacante_skills = _normalize(v.requisitos)
            if not vacante_skills:
                continue

            match = perfil_skills & vacante_skills
            faltantes = vacante_skills - perfil_skills

            # Score: porcentaje de requisitos que el candidato cumple
            score = len(match) / len(vacante_skills) if vacante_skills else 0

            # Bonus por salario dentro del rango esperado
            if perfil.aspiracion_salarial_min and v.salario_max:
                if v.salario_max >= perfil.aspiracion_salarial_min:
                    score += 0.1

            # Bonus por modalidad preferida
            if perfil.modalidad_preferida and v.modalidad:
                if perfil.modalidad_preferida.lower() == v.modalidad.lower():
                    score += 0.05

            scored.append(
                VacanteConScore(
                    id=v.id,
                    titulo=v.titulo,
                    empresa=v.empresa,
                    ubicacion=v.ubicacion,
                    modalidad=v.modalidad,
                    salario_min=v.salario_min,
                    salario_max=v.salario_max,
                    descripcion=v.descripcion,
                    requisitos=v.requisitos,
                    url=v.url,
                    estado=v.estado,
                    area=v.area,
                    created_at=v.created_at,
                    score=round(score, 3),
                    skills_match=sorted(match),
                    skills_faltantes=sorted(faltantes),
                )
            )

        # Ordenar por score descendente
        scored.sort(key=lambda x: x.score, reverse=True)
        return scored[:limit]