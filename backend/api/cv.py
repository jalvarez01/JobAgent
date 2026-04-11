from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from uuid import uuid4
from pydantic import BaseModel

from backend.domain.agents.cargar import load_document
from backend.domain.agents.analizar import analizar_cv

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

RESULT_DIR = Path("storage")
RESULT_DIR.mkdir(parents=True, exist_ok=True)


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

    out_path = RESULT_DIR / f"analisis_{uuid4().hex}.txt"
    out_path.write_text(resultado, encoding="utf-8")

    return {"resultado": resultado}