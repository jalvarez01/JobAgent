from collections import Counter
from sqlalchemy.orm import Session

from backend.infrastructure.persistence.models.perfil import PerfilModel
from backend.infrastructure.persistence.models.vacante import VacanteModel
from backend.infrastructure.persistence.models.postulacion import PostulacionModel


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def metricas_generales(self) -> dict:
        """Devuelve los KPI principales del sistema."""
        total_candidatos = self.db.query(PerfilModel).count()
        total_vacantes = self.db.query(VacanteModel).count()
        vacantes_activas = (
            self.db.query(VacanteModel)
            .filter(VacanteModel.estado == "activa")
            .count()
        )
        total_postulaciones = self.db.query(PostulacionModel).count()

        # Postulaciones por estado
        postulaciones = self.db.query(PostulacionModel).all()
        por_estado = Counter(p.estado for p in postulaciones)

        return {
            "total_candidatos": total_candidatos,
            "total_vacantes": total_vacantes,
            "vacantes_activas": vacantes_activas,
            "total_postulaciones": total_postulaciones,
            "postulaciones_por_estado": dict(por_estado),
        }

    def top_skills(self, limit: int = 10) -> list[dict]:
        """Ranking de skills más demandados, agregando los de todas las vacantes."""
        vacantes = self.db.query(VacanteModel).all()
        contador = Counter()
        for v in vacantes:
            if not v.requisitos:
                continue
            for skill in v.requisitos.split(";"):
                skill_limpio = skill.strip().lower()
                if skill_limpio:
                    contador[skill_limpio] += 1

        total_skills = sum(contador.values()) or 1
        return [
            {
                "skill": skill,
                "count": count,
                "porcentaje": round(count / total_skills * 100, 1),
            }
            for skill, count in contador.most_common(limit)
        ]

    def top_skills_candidatos(self, limit: int = 10) -> list[dict]:
        """Ranking de skills más comunes entre los candidatos."""
        perfiles = self.db.query(PerfilModel).all()
        contador = Counter()
        for p in perfiles:
            skills = getattr(p, "skills", None) or []
            for skill in skills:
                skill_limpio = (skill or "").strip().lower()
                if skill_limpio:
                    contador[skill_limpio] += 1

        total = sum(contador.values()) or 1
        return [
            {
                "skill": skill,
                "count": count,
                "porcentaje": round(count / total * 100, 1),
            }
            for skill, count in contador.most_common(limit)
        ]

    def vacantes_mas_populares(self, limit: int = 5) -> list[dict]:
        """Vacantes con mayor número de postulaciones recibidas."""
        postulaciones = self.db.query(PostulacionModel).all()
        contador = Counter(p.vacante_id for p in postulaciones)

        resultado = []
        for vacante_id, count in contador.most_common(limit):
            vacante = (
                self.db.query(VacanteModel)
                .filter(VacanteModel.id == vacante_id)
                .first()
            )
            if vacante:
                resultado.append({
                    "vacante_id": vacante.id,
                    "titulo": vacante.titulo,
                    "empresa": vacante.empresa,
                    "total_postulaciones": count,
                })
        return resultado

    def distribucion_nivel_educativo(self) -> list[dict]:
        """Cuántos candidatos hay en cada nivel educativo."""
        perfiles = self.db.query(PerfilModel).all()
        contador = Counter(
            (p.nivel_educativo or "No especificado") for p in perfiles
        )
        total = sum(contador.values()) or 1
        return [
            {
                "nivel": nivel,
                "count": count,
                "porcentaje": round(count / total * 100, 1),
            }
            for nivel, count in contador.most_common()
        ]

    def tasa_match_promedio(self) -> dict:
        """Promedio de score_match en postulaciones manuales/auto."""
        postulaciones = self.db.query(PostulacionModel).all()
        scores = []
        for p in postulaciones:
            try:
                if p.score_match is not None:
                    scores.append(int(p.score_match))
            except (ValueError, TypeError):
                continue

        if not scores:
            return {"promedio": 0, "total_postulaciones_con_score": 0}

        return {
            "promedio": round(sum(scores) / len(scores), 1),
            "total_postulaciones_con_score": len(scores),
        }

    def resumen_completo(self) -> dict:
        """Agrega todas las métricas en una sola llamada para minimizar requests."""
        return {
            "metricas": self.metricas_generales(),
            "top_skills_demandados": self.top_skills(),
            "top_skills_candidatos": self.top_skills_candidatos(),
            "vacantes_populares": self.vacantes_mas_populares(),
            "distribucion_educativa": self.distribucion_nivel_educativo(),
            "tasa_match": self.tasa_match_promedio(),
        }