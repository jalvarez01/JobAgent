"""
Estado compartido del grafo de agentes.
Cada nodo del grafo lee y escribe sobre este estado.
"""
from __future__ import annotations

from typing import Any, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    """Estado que fluye por el grafo de agentes de JobAgent."""

    # --- Input ---
    perfil_id: str
    cv_texto: Optional[str]

    # --- Perfil (output del agente de perfil) ---
    perfil_datos: Optional[dict]       # datos estructurados extraídos del CV
    perfil_completo: bool              # ¿el perfil tiene todos los campos requeridos?
    campos_faltantes: list[str]        # campos que faltan por llenar

    # --- Vacantes (output del agente de vacantes) ---
    vacantes_disponibles: list[dict]   # vacantes cargadas/encontradas
    vacantes_nuevas: int               # cantidad de vacantes nuevas detectadas

    # --- Recomendación (output del agente de recomendación) ---
    recomendaciones: list[dict]        # vacantes rankeadas con score
    top_match: Optional[dict]          # mejor match

    # --- Postulación (output del agente de postulación) ---
    postulaciones_realizadas: list[dict]
    postulaciones_count: int

    # --- Seguimiento ---
    proximos_pasos: list[str]          # acciones sugeridas al candidato
    notificaciones: list[str]          # mensajes para el candidato

    # --- Meta ---
    errores: list[str]                 # errores acumulados
    log: list[str]                     # log de acciones de cada agente
