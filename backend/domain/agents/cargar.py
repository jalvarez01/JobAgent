from pathlib import Path
from typing import Union
from langchain_pymupdf4llm import PyMuPDF4LLMLoader
from langchain_community.document_loaders import Docx2txtLoader


def load_document(path: Union[str, Path]) -> str:
    path = Path(path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        loader = PyMuPDF4LLMLoader(str(path))

    elif ext == ".docx":
        loader = Docx2txtLoader(str(path))

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    docs = loader.load()

    text = "\n".join(d.page_content for d in docs).strip()

    return text