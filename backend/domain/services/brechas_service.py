from collections import Counter

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.perfil import PerfilModel
from backend.infrastructure.persistence.models.vacante import VacanteModel


def _normalizar(skill: str) -> str:
    return (skill or "").strip().lower()


class BrechasService:
    """Analiza qué skills demandados por el mercado le faltan al candidato."""

    def __init__(self, db: Session):
        self.db = db

    def analizar(self, perfil_id: str, limit_top: int = 15) -> dict:
        perfil = (
            self.db.query(PerfilModel)
            .filter(PerfilModel.id == perfil_id)
            .first()
        )
        if not perfil:
            raise ValueError("Perfil no encontrado")

        # Skills del usuario normalizados
        skills_usuario_raw = getattr(perfil, "skills", None) or []
        skills_usuario = {_normalizar(s) for s in skills_usuario_raw if _normalizar(s)}

        # Vacantes activas
        vacantes = (
            self.db.query(VacanteModel)
            .filter(VacanteModel.estado == "activa")
            .all()
        )

        total_vacantes_activas = len(vacantes)
        if total_vacantes_activas == 0:
            return {
                "total_vacantes_analizadas": 0,
                "skills_usuario": sorted(skills_usuario),
                "skills_faltantes": [],
                "perfil_competitivo": True,
                "mensaje": "No hay vacantes activas en el sistema para analizar",
            }

        # Contar skills demandados por el mercado
        demanda = Counter()
        # Mapeo: skill -> conjunto de vacante_id que la requieren (para calcular desbloqueables)
        vacantes_por_skill: dict[str, set] = {}
        # Mapeo: skill -> set de vacante_ids que el usuario YA podría aplicar (cumple todos los requisitos)
        # No usamos eso; usamos algo más simple: cuántas vacantes el usuario aún no califica que sí podría con cada skill nuevo.

        for v in vacantes:
            if not v.requisitos:
                continue
            requisitos = {_normalizar(s) for s in v.requisitos.split(";") if _normalizar(s)}
            for skill in requisitos:
                demanda[skill] += 1
                vacantes_por_skill.setdefault(skill, set()).add(v.id)

        # Skills que demanda el mercado pero el usuario NO tiene
        skills_faltantes = []
        for skill, frecuencia in demanda.most_common():
            if skill in skills_usuario:
                continue

            # Vacantes adicionales que se desbloquearían con este skill:
            # las que requieren ese skill y donde al usuario aún le faltaba al menos uno (esta).
            vacantes_que_lo_piden = vacantes_por_skill.get(skill, set())
            porcentaje_demanda = round(frecuencia / total_vacantes_activas * 100, 1)

            skills_faltantes.append({
                "skill": skill,
                "vacantes_que_lo_requieren": frecuencia,
                "porcentaje_demanda": porcentaje_demanda,
                "vacantes_desbloqueables": len(vacantes_que_lo_piden),
            })

        # Ya están ordenados por demanda gracias a most_common()
        skills_faltantes_top = skills_faltantes[:limit_top]
        perfil_competitivo = len(skills_faltantes_top) == 0

        mensaje = (
            "Tu perfil cubre los skills más demandados del mercado actual."
            if perfil_competitivo
            else f"Hay {len(skills_faltantes)} skills demandados que aún no están en tu perfil."
        )

        return {
            "total_vacantes_analizadas": total_vacantes_activas,
            "skills_usuario": sorted(skills_usuario),
            "skills_faltantes": skills_faltantes_top,
            "perfil_competitivo": perfil_competitivo,
            "mensaje": mensaje,
        }