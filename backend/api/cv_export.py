from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from urllib.parse import quote

from backend.infrastructure.persistence.database import get_db
from backend.domain.services.cv_pdf_service import CVPDFService

router = APIRouter()


@router.get("/exportar/{perfil_id}/validar")
def validar_completitud(perfil_id: str, db: Session = Depends(get_db)):
    """Verifica si el perfil tiene los campos mínimos para exportar como CV."""
    try:
        svc = CVPDFService(db)
        return svc.verificar_perfil(perfil_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/exportar/{perfil_id}")
def exportar_cv_pdf(perfil_id: str, db: Session = Depends(get_db)):
    """Genera y descarga el CV del usuario en formato PDF."""
    try:
        svc = CVPDFService(db)
        pdf_bytes, filename = svc.generar_pdf(perfil_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {e}")

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{quote(filename)}"',
        },
    )