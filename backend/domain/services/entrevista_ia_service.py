"""Servicio de IA para Entrevistas.

Dos funciones:
1. Generar preguntas de entrevista personalizadas según el perfil + vacante.
2. Generar el mensaje de invitación a la entrevista para el candidato.

Ambas usan Groq con Llama 3.3-70b.
"""
import json
import os
import re

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository
from backend.infrastructure.persistence.repositories.postulacion_repo import PostulacionRepository


def _safe(obj, attr, default=""):
    value = getattr(obj, attr, None)
    if value is None:
        return default
    return str(value)


def _safe_list(obj, attr) -> list:
    value = getattr(obj, attr, None)
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


def _get_llm():
    from langchain_groq import ChatGroq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY no configurada en variables de entorno")

    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0.5,
        max_tokens=1800,
    )


def _extraer_json(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No se encontró JSON en la respuesta del LLM: {raw[:200]}")
    return json.loads(cleaned[start:end + 1])


class EntrevistaIAService:
    def __init__(self, db: Session):
        self.db = db
        self.perfil_repo = PerfilRepository(db)
        self.vacante_repo = VacanteRepository(db)
        self.postulacion_repo = PostulacionRepository(db)

    # ============== GENERAR PREGUNTAS ==============

    def generar_preguntas(self, perfil_id: str, vacante_id: str) -> dict:
        """Genera 6-7 preguntas de entrevista personalizadas."""
        perfil = self.perfil_repo.get_by_id(perfil_id)
        if not perfil:
            raise ValueError("Perfil no encontrado")

        vacante = self.vacante_repo.get_by_id(vacante_id)
        if not vacante:
            raise ValueError("Vacante no encontrada")

        from langchain_core.messages import SystemMessage, HumanMessage

        llm = _get_llm()

        perfil_payload = {
            "nombre": _safe(perfil, "nombre_completo"),
            "skills": _safe_list(perfil, "skills"),
            "nivel_educativo": _safe(perfil, "nivel_educativo"),
            "titulo_educativo": _safe(perfil, "titulo_educativo"),
            "experiencia_anos": _safe(perfil, "experiencia_anos"),
            "cargo_actual": _safe(perfil, "cargo_actual"),
            "empresa_actual": _safe(perfil, "empresa_actual"),
        }

        vacante_payload = {
            "titulo": _safe(vacante, "titulo"),
            "empresa": _safe(vacante, "empresa"),
            "modalidad": _safe(vacante, "modalidad"),
            "requisitos": [
                s.strip() for s in _safe(vacante, "requisitos").split(";") if s.strip()
            ],
            "descripcion": _safe(vacante, "descripcion"),
        }

        system = (
            "Eres un entrevistador senior con experiencia en selección de talento. "
            "Diseñas entrevistas justas, equilibradas y personalizadas. "
            "Tus preguntas son específicas al perfil y al rol, nunca genéricas. "
            "Respondes siempre en español y exclusivamente en formato JSON válido."
        )

        user_prompt = f"""Genera un set de preguntas para una entrevista personalizada.

CANDIDATO:
{json.dumps(perfil_payload, ensure_ascii=False, indent=2)}

VACANTE:
{json.dumps(vacante_payload, ensure_ascii=False, indent=2)}

INSTRUCCIONES:
1. Genera entre 6 y 7 preguntas en total.
2. Distribución:
   - 2 preguntas TÉCNICAS específicas a los skills de la vacante y del candidato (no genéricas).
   - 2 preguntas situacionales/comportamentales (STAR method) relevantes al rol.
   - 1 pregunta sobre experiencia previa concreta del candidato (referencia a su cargo o empresa actual si la hay).
   - 1 pregunta sobre motivación y fit cultural.
   - 1 pregunta opcional de cierre.
3. Cada pregunta debe incluir:
   - "pregunta": el texto de la pregunta (clara, abierta, sin sí/no).
   - "categoria": "técnica" | "comportamental" | "experiencia" | "motivación" | "cierre".
   - "objetivo": qué evalúa la pregunta en 1 frase corta.
   - "pista": una sugerencia breve para el entrevistador sobre qué buscar en la respuesta.

RESPONDE EXCLUSIVAMENTE CON ESTE JSON:
{{
  "preguntas": [
    {{
      "pregunta": "...",
      "categoria": "...",
      "objetivo": "...",
      "pista": "..."
    }}
  ]
}}"""

        try:
            response = llm.invoke([
                SystemMessage(content=system),
                HumanMessage(content=user_prompt),
            ])
            raw = response.content if hasattr(response, "content") else str(response)
            parsed = _extraer_json(raw)

            if "preguntas" not in parsed or not isinstance(parsed["preguntas"], list):
                raise ValueError("Respuesta del LLM sin formato esperado")

            preguntas = parsed["preguntas"][:7]
            return {
                "candidato": _safe(perfil, "nombre_completo"),
                "vacante": _safe(vacante, "titulo"),
                "empresa": _safe(vacante, "empresa"),
                "preguntas": preguntas,
                "uso_ia": True,
            }
        except Exception as e:
            print(f"[entrevista_ia] Error generando preguntas: {e}")
            raise

    # ============== GENERAR MENSAJE DE INVITACIÓN ==============

    def generar_mensaje_invitacion(
        self,
        perfil_id: str,
        vacante_id: str,
        fecha: str | None = None,
        modalidad: str | None = None,
        duracion_minutos: int | None = None,
        link_reunion: str | None = None,
        nombre_entrevistador: str | None = None,
    ) -> dict:
        """Genera el texto del mensaje de invitación a entrevista."""
        perfil = self.perfil_repo.get_by_id(perfil_id)
        if not perfil:
            raise ValueError("Perfil no encontrado")

        vacante = self.vacante_repo.get_by_id(vacante_id)
        if not vacante:
            raise ValueError("Vacante no encontrada")

        from langchain_core.messages import SystemMessage, HumanMessage

        llm = _get_llm()

        contexto = {
            "candidato_nombre": _safe(perfil, "nombre_completo"),
            "candidato_email": _safe(perfil, "email"),
            "candidato_skills_relevantes": _safe_list(perfil, "skills")[:6],
            "vacante_titulo": _safe(vacante, "titulo"),
            "empresa": _safe(vacante, "empresa"),
            "modalidad_vacante": _safe(vacante, "modalidad"),
            "requisitos_clave": [
                s.strip() for s in _safe(vacante, "requisitos").split(";") if s.strip()
            ][:5],
            "fecha_entrevista": fecha or "por confirmar",
            "modalidad_entrevista": modalidad or "por confirmar",
            "duracion_minutos": duracion_minutos or 45,
            "link_reunion": link_reunion or "",
            "nombre_entrevistador": nombre_entrevistador or "el equipo de selección",
        }

        system = (
            "Eres un especialista en comunicación de talento humano. "
            "Escribes mensajes de invitación a entrevista profesionales, cálidos y respetuosos. "
            "Tu tono es formal pero humano, sin clichés corporativos. "
            "Respondes en español y devuelves siempre JSON válido con asunto y cuerpo del mensaje."
        )

        user_prompt = f"""Escribe el mensaje de invitación a entrevista para el candidato.

CONTEXTO:
{json.dumps(contexto, ensure_ascii=False, indent=2)}

INSTRUCCIONES:
1. Devuelve un "asunto" corto, claro y específico (no genérico tipo "Invitación a entrevista", agrega el rol y empresa).
2. Devuelve un "cuerpo" del mensaje con:
   - Saludo personalizado (usa el nombre del candidato).
   - Confirmación de que avanzó en el proceso para ese rol específico.
   - Datos logísticos: fecha, modalidad, duración, link si aplica.
   - 2-3 puntos sobre QUÉ PREPARAR (debe ser específico, no genérico). Menciona los skills/requisitos clave de la vacante.
   - Quién será el entrevistador o el equipo que lo recibe.
   - Cierre cordial con CTA para confirmar asistencia.
3. El mensaje debe sonar natural, no como plantilla. Usa párrafos cortos. Total entre 150-220 palabras.
4. NO uses emojis. NO uses lenguaje exageradamente entusiasta.
5. NO inventes datos no proporcionados: si la fecha es "por confirmar", indícalo así.

RESPONDE EXCLUSIVAMENTE CON ESTE JSON:
{{
  "asunto": "...",
  "cuerpo": "..."
}}"""

        try:
            response = llm.invoke([
                SystemMessage(content=system),
                HumanMessage(content=user_prompt),
            ])
            raw = response.content if hasattr(response, "content") else str(response)
            parsed = _extraer_json(raw)

            if "asunto" not in parsed or "cuerpo" not in parsed:
                raise ValueError("Respuesta del LLM sin formato esperado")

            return {
                "candidato": _safe(perfil, "nombre_completo"),
                "candidato_email": _safe(perfil, "email"),
                "vacante": _safe(vacante, "titulo"),
                "empresa": _safe(vacante, "empresa"),
                "asunto": parsed["asunto"],
                "cuerpo": parsed["cuerpo"],
                "uso_ia": True,
            }
        except Exception as e:
            print(f"[entrevista_ia] Error generando mensaje: {e}")
            raise