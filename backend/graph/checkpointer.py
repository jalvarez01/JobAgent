"""
Checkpointer: almacena el resultado de cada ejecución del grafo.
En producción se usaría Redis o PostgreSQL; aquí usamos SQLite vía la DB existente.
"""
import json
from datetime import datetime, timezone

from backend.infrastructure.persistence.database import SessionLocal
from backend.infrastructure.persistence.models.traza import TrazaModel


def save_pipeline_result(perfil_id: str, result: dict) -> None:
    """Guarda un snapshot del resultado del pipeline como traza."""
    db = SessionLocal()
    try:
        # Serializar solo lo que tiene sentido guardar
        snapshot = {
            "recomendaciones_count": len(result.get("recomendaciones", [])),
            "postulaciones_count": result.get("postulaciones_count", 0),
            "perfil_completo": result.get("perfil_completo", False),
            "campos_faltantes": result.get("campos_faltantes", []),
            "proximos_pasos": result.get("proximos_pasos", []),
            "notificaciones": result.get("notificaciones", []),
            "errores": result.get("errores", []),
        }

        traza = TrazaModel(
            perfil_id=perfil_id,
            tipo="pipeline_ejecutado",
            descripcion=f"Pipeline completo ejecutado. {snapshot['recomendaciones_count']} recomendaciones, {snapshot['postulaciones_count']} postulaciones.",
            origen="sistema",
            extra_data=json.dumps(snapshot, ensure_ascii=False),
        )
        db.add(traza)
        db.commit()
    finally:
        db.close()
