"""
Agente de Vacantes: carga vacantes disponibles y las normaliza.
En producción usaría APIs externas o scrapers; en MVP lee de la DB.
"""
from __future__ import annotations

from backend.graph.state import AgentState
from backend.infrastructure.persistence.database import SessionLocal
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository


def vacantes_node(state: AgentState) -> dict:
    """Nodo del grafo: carga vacantes activas de la base de datos."""
    log = state.get("log", [])
    errores = state.get("errores", [])

    log.append("[vacantes_agent] Cargando vacantes activas...")

    try:
        db = SessionLocal()
        try:
            repo = VacanteRepository(db)
            vacantes = repo.get_all(estado="activa")

            vacantes_dict = []
            for v in vacantes:
                vacantes_dict.append({
                    "id": v.id,
                    "titulo": v.titulo,
                    "empresa": v.empresa,
                    "ubicacion": v.ubicacion,
                    "modalidad": v.modalidad,
                    "salario_min": v.salario_min,
                    "salario_max": v.salario_max,
                    "descripcion": v.descripcion,
                    "requisitos": v.requisitos,
                    "url": v.url,
                })

            log.append(f"[vacantes_agent] {len(vacantes_dict)} vacantes activas encontradas")

            return {
                "vacantes_disponibles": vacantes_dict,
                "vacantes_nuevas": len(vacantes_dict),
                "log": log,
            }
        finally:
            db.close()

    except Exception as e:
        errores.append(f"[vacantes_agent] Error: {str(e)}")
        return {
            "vacantes_disponibles": [],
            "vacantes_nuevas": 0,
            "errores": errores,
            "log": log,
        }
