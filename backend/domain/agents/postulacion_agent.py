"""
Agente de Postulación: simula autopostulación para las vacantes
con score alto, registrando la acción en la base de datos.
"""
from __future__ import annotations

from backend.graph.state import AgentState
from backend.infrastructure.persistence.database import SessionLocal
from backend.infrastructure.persistence.repositories.postulacion_repo import PostulacionRepository

# Umbral mínimo de score para autopostulación
UMBRAL_AUTO = 0.5


def postulacion_node(state: AgentState) -> dict:
    """Nodo del grafo: crea postulaciones automáticas para los mejores matches."""
    log = state.get("log", [])
    errores = state.get("errores", [])

    perfil_id = state.get("perfil_id", "")
    recomendaciones = state.get("recomendaciones", [])

    if not perfil_id:
        log.append("[postulacion_agent] Sin perfil_id, no se puede postular")
        return {"postulaciones_realizadas": [], "postulaciones_count": 0, "log": log}

    # Filtrar solo vacantes con score >= umbral
    candidatas = [r for r in recomendaciones if r.get("score", 0) >= UMBRAL_AUTO]

    if not candidatas:
        log.append(f"[postulacion_agent] Ninguna vacante supera el umbral de {UMBRAL_AUTO*100:.0f}%")
        return {"postulaciones_realizadas": [], "postulaciones_count": 0, "log": log}

    log.append(f"[postulacion_agent] {len(candidatas)} vacantes superan el umbral. Creando postulaciones...")

    postulaciones = []
    db = SessionLocal()
    try:
        repo = PostulacionRepository(db)

        for vacante in candidatas:
            try:
                post = repo.create(
                    perfil_id=perfil_id,
                    vacante_id=str(vacante["id"]),
                    tipo="auto",
                    notas=f"Autopostulación por agente. Score: {vacante['score']*100:.0f}%. Skills match: {', '.join(vacante.get('skills_match', []))}",
                    score_match=str(round(vacante["score"] * 100)),
                )
                postulaciones.append({
                    "id": post.id,
                    "vacante_id": vacante["id"],
                    "titulo": vacante.get("titulo", ""),
                    "score": vacante["score"],
                    "estado": post.estado,
                })
                log.append(f"[postulacion_agent] ✓ Postulado a: {vacante.get('titulo')} ({vacante['score']*100:.0f}%)")
            except ValueError:
                log.append(f"[postulacion_agent] ⊘ Ya postulado a: {vacante.get('titulo')}")
            except Exception as e:
                errores.append(f"[postulacion_agent] Error en {vacante.get('titulo')}: {str(e)}")
    finally:
        db.close()

    return {
        "postulaciones_realizadas": postulaciones,
        "postulaciones_count": len(postulaciones),
        "errores": errores,
        "log": log,
    }
