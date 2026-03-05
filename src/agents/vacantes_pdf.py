from __future__ import annotations

from pathlib import Path
from io import StringIO
import pandas as pd

from langchain_pymupdf4llm import PyMuPDF4LLMLoader  # para extraer texto del PDF  [oai_citation:0‡Artifex](https://artifex.com/blog/building-a-multimodal-llm-application-with-pymupdf4llm?utm_source=chatgpt.com)


VACANTES_COLUMNS = ["id","titulo","empresa","ubicacion","modalidad","descripcion","requisitos","url"]

def pdf_to_text(pdf_path: str) -> str:
    pdf_path = str(Path(pdf_path).resolve())
    loader = PyMuPDF4LLMLoader(pdf_path)
    docs = loader.load()
    return "\n".join(d.page_content for d in docs).strip()

def parse_vacantes_from_text(text: str) -> pd.DataFrame:
  
    # busca el header
    header = "id,titulo,empresa,ubicacion,modalidad,descripcion,requisitos,url"
    idx = text.lower().find(header)
    if idx == -1:
        raise ValueError("No encontré el encabezado CSV dentro del PDF.")

    csv_block = text[idx:]
    df = pd.read_csv(StringIO(csv_block))
    df = df[VACANTES_COLUMNS]
    return df

def pdf_to_vacantes_df(pdf_path: str) -> pd.DataFrame:
    text = pdf_to_text(pdf_path)
    return parse_vacantes_from_text(text)

def save_vacantes_csv(df: pd.DataFrame, out_csv_path: str) -> None:
    Path(out_csv_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv_path, index=False, encoding="utf-8")