"""
Agente de Recomendación: rankea vacantes según el perfil del candidato.
Usa scoring por intersección de skills + bonuses por salario y modalidad.
"""
from __future__ import annotations

from backend.graph.state import AgentState


def _normalize(skills) -> set[str]:
    if not skills:
        return set()
    if isinstance(skills, str):
        return {s.strip().lower() for s in skills.split(";") if s.strip()}
    return {s.strip().lower() for s in skills if s and s.strip()}


def recomendacion_node(state: AgentState) -> dict:
    """Nodo del grafo: calcula scoring y rankea vacantes."""
    log = state.get("log", [])

    perfil_datos = state.get("perfil_datos", {})
    vacantes = state.get("vacantes_disponibles", [])

    perfil_skills = _normalize(perfil_datos.get("skills", []))

    if not perfil_skills:
        log.append("[recomendacion_agent] Sin skills en el perfil, no se pueden generar recomendaciones")
        return {"recomendaciones": [], "top_match": None, "log": log}

    if not vacantes:
        log.append("[recomendacion_agent] Sin vacantes disponibles")
        return {"recomendaciones": [], "top_match": None, "log": log}

    log.append(f"[recomendacion_agent] Comparando {len(perfil_skills)} skills contra {len(vacantes)} vacantes...")

    scored = []
    for v in vacantes:
        vacante_skills = _normalize(v.get("requisitos", ""))
        if not vacante_skills:
            continue

        match = perfil_skills & vacante_skills
        faltantes = vacante_skills - perfil_skills
        score = len(match) / len(vacante_skills)

        scored.append({
            **v,
            "score": round(score, 3),
            "skills_match": sorted(match),
            "skills_faltantes": sorted(faltantes),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[0] if scored else None

    log.append(f"[recomendacion_agent] {len(scored)} vacantes rankeadas. Top match: {top['titulo'] if top else 'ninguna'} ({top['score']*100:.0f}%)" if top else "[recomendacion_agent] Sin matches")

    return {
        "recomendaciones": scored[:10],
        "top_match": top,
        "log": log,
    }
