"""
Agente de Seguimiento: genera recordatorios, próximos pasos
y notificaciones basadas en el estado actual del proceso.
"""
from __future__ import annotations

from backend.graph.state import AgentState


def seguimiento_node(state: AgentState) -> dict:
    """Nodo del grafo: genera próximos pasos y notificaciones."""
    log = state.get("log", [])

    perfil_completo = state.get("perfil_completo", False)
    campos_faltantes = state.get("campos_faltantes", [])
    recomendaciones = state.get("recomendaciones", [])
    postulaciones = state.get("postulaciones_realizadas", [])
    top_match = state.get("top_match")

    proximos_pasos = []
    notificaciones = []

    # --- Perfil ---
    if not perfil_completo:
        faltantes_str = ", ".join(campos_faltantes[:5])
        proximos_pasos.append(f"Completar tu perfil: faltan {len(campos_faltantes)} campos ({faltantes_str})")
        notificaciones.append("Tu perfil está incompleto. Completarlo mejora tus recomendaciones.")

    # --- Recomendaciones ---
    if recomendaciones:
        buenos = [r for r in recomendaciones if r.get("score", 0) >= 0.5]
        notificaciones.append(f"Encontramos {len(recomendaciones)} vacantes relevantes ({len(buenos)} con match alto)")

        if top_match:
            proximos_pasos.append(
                f"Revisa tu mejor match: {top_match.get('titulo')} en {top_match.get('empresa')} ({top_match.get('score', 0)*100:.0f}%)"
            )

        # Skills más demandadas que no tiene
        all_faltantes = {}
        for r in recomendaciones[:5]:
            for s in r.get("skills_faltantes", []):
                all_faltantes[s] = all_faltantes.get(s, 0) + 1
        top_skills = sorted(all_faltantes.items(), key=lambda x: x[1], reverse=True)[:3]
        if top_skills:
            skills_str = ", ".join(s for s, _ in top_skills)
            proximos_pasos.append(f"Skills más demandadas que podrías desarrollar: {skills_str}")

    else:
        proximos_pasos.append("Agrega más skills a tu perfil para mejorar las recomendaciones")

    # --- Postulaciones ---
    if postulaciones:
        notificaciones.append(f"Se realizaron {len(postulaciones)} postulaciones automáticas")
        proximos_pasos.append("Revisa tus postulaciones en el tablero de seguimiento")
    else:
        proximos_pasos.append("Explora las vacantes recomendadas y postúlate a las que te interesen")

    log.append(f"[seguimiento_agent] Generados {len(proximos_pasos)} pasos y {len(notificaciones)} notificaciones")

    return {
        "proximos_pasos": proximos_pasos,
        "notificaciones": notificaciones,
        "log": log,
    }
