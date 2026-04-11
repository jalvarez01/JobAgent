from pathlib import Path
from typing import Optional
import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


def get_llm() -> Optional[ChatGroq]:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return None  # no rompe el servidor

    return ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.1,
        model_kwargs={"top_p": 0.2, "seed": 1337},
    )


def analizar_cv(texto: str) -> str:
    llm = get_llm()

    if llm is None:
        return "⚠️ No hay API KEY configurada. Agrega GROQ_API_KEY en .env"

    prompt = f"""
    Analiza este CV como un recruiter profesional.

    CV:
    {texto}

    Devuelve:
    - Resumen
    - Puntos fuertes
    - Puntos débiles
    - Recomendaciones
    """

    response = llm.invoke(prompt)

    return response.content