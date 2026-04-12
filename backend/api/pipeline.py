from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.graph.runner import run_pipeline
from backend.graph.checkpointer import save_pipeline_result

router = APIRouter()


class PipelineRequest(BaseModel):
    perfil_id: str
    cv_texto: Optional[str] = ""


class PipelineResponse(BaseModel):
    perfil_completo: bool
    campos_faltantes: list[str]
    recomendaciones: list[dict]
    top_match: Optional[dict]
    postulaciones_realizadas: list[dict]
    postulaciones_count: int
    proximos_pasos: list[str]
    notificaciones: list[str]
    errores: list[str]
    log: list[str]


@router.post("/ejecutar", response_model=PipelineResponse)
def ejecutar_pipeline(req: PipelineRequest):
    """Ejecuta el pipeline completo de agentes para un candidato."""
    try:
        result = run_pipeline(perfil_id=req.perfil_id, cv_texto=req.cv_texto)

        # Guardar snapshot del resultado
        save_pipeline_result(req.perfil_id, result)

        return PipelineResponse(
            perfil_completo=result.get("perfil_completo", False),
            campos_faltantes=result.get("campos_faltantes", []),
            recomendaciones=result.get("recomendaciones", []),
            top_match=result.get("top_match"),
            postulaciones_realizadas=result.get("postulaciones_realizadas", []),
            postulaciones_count=result.get("postulaciones_count", 0),
            proximos_pasos=result.get("proximos_pasos", []),
            notificaciones=result.get("notificaciones", []),
            errores=result.get("errores", []),
            log=result.get("log", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en pipeline: {str(e)}")
