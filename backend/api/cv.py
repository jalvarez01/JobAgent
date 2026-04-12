from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from uuid import uuid4
from pydantic import BaseModel

from backend.config import UPLOAD_DIR, STORAGE_DIR
from backend.domain.agents.cargar import load_document
from backend.domain.agents.analizar import analizar_cv, analizar_cv_estructurado

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


class AnalizarRequest(BaseModel):
    texto: str


@router.post("/upload")
async def upload_cv(file: UploadFile = File(...)):
    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Solo se aceptan: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    unique_name = f"{uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR / unique_name

    content = await file.read()
    file_path.write_bytes(content)

    texto = load_document(file_path)

    return {"message": "Documento cargado", "texto": texto}


@router.post("/analizar")
async def analizar(body: AnalizarRequest):
    if not body.texto.strip():
        raise HTTPException(status_code=400, detail="El texto no puede estar vacío")

    resultado = analizar_cv(body.texto)

    out_path = STORAGE_DIR / f"analisis_{uuid4().hex}.txt"
    out_path.write_text(resultado, encoding="utf-8")

    return {"resultado": resultado}


@router.post("/analizar-estructurado")
async def analizar_estructurado(body: AnalizarRequest):
    """Analiza el CV y devuelve datos estructurados para pre-llenar el perfil."""
    if not body.texto.strip():
        raise HTTPException(status_code=400, detail="El texto no puede estar vacío")

    resultado = analizar_cv_estructurado(body.texto)

    if "error" in resultado and "raw" not in resultado:
        raise HTTPException(status_code=503, detail=resultado["error"])

    return {"resultado": resultado}
