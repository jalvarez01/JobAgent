"""
Agente de Perfil: analiza el CV, extrae datos estructurados,
detecta campos faltantes y calcula completitud.
"""
from __future__ import annotations

from backend.graph.state import AgentState
from backend.domain.agents.analizar import analizar_cv_estructurado


_CAMPOS_REQUERIDOS = [
    "nombre_completo", "email", "telefono", "ubicacion",
    "resumen_profesional", "nivel_educativo", "titulo_educativo",
    "institucion_educativa", "experiencia_anos", "skills",
]


def perfil_node(state: AgentState) -> dict:
    """Nodo del grafo: analiza CV y estructura datos del perfil."""
    log = state.get("log", [])
    errores = state.get("errores", [])

    cv_texto = state.get("cv_texto", "")
    if not cv_texto:
        log.append("[perfil_agent] Sin CV para analizar, se requiere input manual")
        return {
            "perfil_datos": {},
            "perfil_completo": False,
            "campos_faltantes": list(_CAMPOS_REQUERIDOS),
            "log": log,
        }

    log.append("[perfil_agent] Analizando CV con IA...")

    try:
        datos = analizar_cv_estructurado(cv_texto)

        if "error" in datos:
            errores.append(f"[perfil_agent] Error IA: {datos['error']}")
            return {
                "perfil_datos": {},
                "perfil_completo": False,
                "campos_faltantes": list(_CAMPOS_REQUERIDOS),
                "errores": errores,
                "log": log,
            }

        # Detectar campos faltantes
        faltantes = []
        for campo in _CAMPOS_REQUERIDOS:
            valor = datos.get(campo)
            if valor is None or valor == "" or valor == []:
                faltantes.append(campo)

        completo = len(faltantes) == 0
        log.append(f"[perfil_agent] Perfil {'completo' if completo else 'incompleto'}: {len(faltantes)} campos faltantes")

        return {
            "perfil_datos": datos,
            "perfil_completo": completo,
            "campos_faltantes": faltantes,
            "log": log,
        }

    except Exception as e:
        errores.append(f"[perfil_agent] Excepción: {str(e)}")
        return {
            "perfil_datos": {},
            "perfil_completo": False,
            "campos_faltantes": list(_CAMPOS_REQUERIDOS),
            "errores": errores,
            "log": log,
        }
