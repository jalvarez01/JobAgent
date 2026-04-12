"""
Runner: ejecuta el grafo completo y devuelve el resultado.
Expone una función simple que el API puede llamar.
"""
from __future__ import annotations

from backend.graph.builder import get_graph
from backend.graph.state import AgentState


def run_pipeline(perfil_id: str, cv_texto: str = "") -> dict:
    """
    Ejecuta el pipeline completo de agentes para un candidato.

    Args:
        perfil_id: ID del perfil del candidato
        cv_texto: texto extraído del CV (opcional si ya tiene perfil)

    Returns:
        Estado final con recomendaciones, postulaciones y próximos pasos
    """
    graph = get_graph()

    initial_state: AgentState = {
        "perfil_id": perfil_id,
        "cv_texto": cv_texto,
        "perfil_datos": {},
        "perfil_completo": False,
        "campos_faltantes": [],
        "vacantes_disponibles": [],
        "vacantes_nuevas": 0,
        "recomendaciones": [],
        "top_match": None,
        "postulaciones_realizadas": [],
        "postulaciones_count": 0,
        "proximos_pasos": [],
        "notificaciones": [],
        "errores": [],
        "log": [],
    }

    result = graph.invoke(initial_state)
    return result
