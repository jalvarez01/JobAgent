import json
import os
from typing import Optional

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from backend.config import GROQ_API_KEY, GROQ_MODEL

load_dotenv()


def get_llm() -> Optional[ChatGroq]:
    api_key = GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    return ChatGroq(
        model_name=GROQ_MODEL,
        temperature=0.1,
        model_kwargs={"top_p": 0.2, "seed": 1337},
    )


def analizar_cv(texto: str) -> str:
    """Análisis de CV en texto libre (retrocompatible)."""
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


def analizar_cv_estructurado(texto: str) -> dict:
    """
    Analiza un CV y devuelve datos estructurados en JSON.
    Extrae información clave para pre-llenar el perfil del candidato.
    """
    llm = get_llm()
    if llm is None:
        return {"error": "No hay API KEY configurada. Agrega GROQ_API_KEY en .env"}

    prompt = f"""Analiza el siguiente CV y extrae la información en formato JSON puro.
No incluyas markdown, backticks ni texto adicional. Solo el JSON.

CV:
{texto}

Devuelve EXACTAMENTE este formato JSON (usa null si no encuentras un campo):
{{
    "nombre_completo": "string",
    "email": "string o null",
    "telefono": "string o null",
    "ubicacion": "ciudad, departamento o null",
    "resumen_profesional": "resumen de 2-3 oraciones del perfil profesional",
    "nivel_educativo": "uno de: bachiller, tecnico, tecnologo, profesional, especialista, maestria, doctorado",
    "titulo_educativo": "nombre del título o null",
    "institucion_educativa": "nombre de la institución o null",
    "experiencia_anos": 0,
    "cargo_actual": "string o null",
    "empresa_actual": "string o null",
    "skills": ["skill1", "skill2", "skill3"],
    "puntos_fuertes": ["punto1", "punto2"],
    "puntos_debiles": ["punto1", "punto2"],
    "recomendaciones": ["recomendación1", "recomendación2"]
}}"""

    response = llm.invoke(prompt)
    content = response.content.strip()

    # Limpiar posibles backticks de markdown
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "error": "No se pudo parsear la respuesta de la IA",
            "raw": content,
        }
