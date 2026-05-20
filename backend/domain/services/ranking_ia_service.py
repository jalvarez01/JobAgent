"""Servicio de Ranking de Candidatos con IA.

Pipeline:
1. Pre-filtra los mejores N candidatos por matching de skills (rápido, determinista).
2. Envía esos candidatos al LLM para que los reordene, asigne un score y dé una
   explicación del fit en lenguaje natural.

Esto resuelve la observación del PO sobre "exploración y adopción de IA en el
proceso de selección de candidato".
"""
import json
import os
import re
from typing import Any

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository
from backend.infrastructure.persistence.repositories.vacante_repo import VacanteRepository


# Pre-filtro: número de candidatos a enviar al LLM
PREFILTRO_TOP = 12
# Final: número de candidatos rankeados que se devuelven al frontend
RANKING_FINAL = 5


def _normalizar(s: str) -> str:
    return (s or "").strip().lower()


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


def _safe(obj, attr, default=""):
    value = getattr(obj, attr, None)
    if value is None:
        return default
    return str(value)


class RankingIAService:
    def __init__(self, db: Session):
        self.db = db
        self.perfil_repo = PerfilRepository(db)
        self.vacante_repo = VacanteRepository(db)

    def rankear_candidatos(self, vacante_id: str) -> dict:
        """Devuelve el top de candidatos para una vacante, rerankeado por IA."""
        vacante = self.vacante_repo.get_by_id(vacante_id)
        if not vacante:
            raise ValueError("Vacante no encontrada")

        # Pre-filtro determinista basado en skills
        prefiltro = self._prefiltrar_candidatos(vacante)
        if not prefiltro:
            return {
                "vacante": self._vacante_dict(vacante),
                "ranking": [],
                "mensaje": "No hay candidatos en el sistema para esta vacante.",
                "uso_ia": False,
            }

        # Si hay muy pocos, no llamamos al LLM (ahorra latencia y tokens)
        if len(prefiltro) <= 2:
            ranking_simple = [
                {
                    "perfil_id": c["perfil"].id,
                    "nombre": _safe(c["perfil"], "nombre_completo", "Sin nombre"),
                    "email": _safe(c["perfil"], "email"),
                    "score": min(95, c["score_base"] * 100),
                    "skills_match": c["skills_match"],
                    "skills_faltantes": c["skills_faltantes"],
                    "fortalezas": "Coincidencia parcial de skills basada en matching directo.",
                    "debilidades": "Análisis IA no aplicado por bajo volumen de candidatos.",
                    "explicacion": "Ranking generado por matching determinista (no IA).",
                }
                for c in prefiltro
            ]
            return {
                "vacante": self._vacante_dict(vacante),
                "ranking": ranking_simple,
                "mensaje": f"Solo {len(prefiltro)} candidato(s) disponible(s). Ranking determinista.",
                "uso_ia": False,
            }

        # Llamar al LLM para rerankear
        try:
            ranking_ia = self._invocar_llm(vacante, prefiltro)
            return {
                "vacante": self._vacante_dict(vacante),
                "ranking": ranking_ia,
                "mensaje": f"Top {len(ranking_ia)} candidatos rankeados por IA sobre {len(prefiltro)} pre-filtrados.",
                "uso_ia": True,
            }
        except Exception as e:
            # Fallback: si el LLM falla, retornamos el ranking determinista
            print(f"[ranking_ia] Fallback a ranking determinista: {e}")
            fallback = [
                {
                    "perfil_id": c["perfil"].id,
                    "nombre": _safe(c["perfil"], "nombre_completo", "Sin nombre"),
                    "email": _safe(c["perfil"], "email"),
                    "score": min(95, int(c["score_base"] * 100)),
                    "skills_match": c["skills_match"],
                    "skills_faltantes": c["skills_faltantes"],
                    "fortalezas": "Análisis basado en coincidencia de skills.",
                    "debilidades": "El servicio de IA no estuvo disponible en este momento.",
                    "explicacion": "Ranking generado por matching determinista (fallback).",
                }
                for c in prefiltro[:RANKING_FINAL]
            ]
            return {
                "vacante": self._vacante_dict(vacante),
                "ranking": fallback,
                "mensaje": "Ranking generado en modo determinista (la IA no respondió).",
                "uso_ia": False,
                "error_ia": str(e),
            }

    def _prefiltrar_candidatos(self, vacante) -> list[dict]:
        """Calcula un score base por matching de skills y devuelve los top N candidatos."""
        requisitos_raw = _safe(vacante, "requisitos", "")
        requisitos = {_normalizar(s) for s in requisitos_raw.split(";") if _normalizar(s)}

        if not requisitos:
            # Si la vacante no tiene requisitos, devolvemos los más completos
            perfiles = self.perfil_repo.get_all() if hasattr(self.perfil_repo, "get_all") else []
            ordenados = sorted(perfiles, key=lambda p: getattr(p, "completitud", 0) or 0, reverse=True)
            return [
                {
                    "perfil": p,
                    "score_base": 0.5,
                    "skills_match": [],
                    "skills_faltantes": list(requisitos),
                }
                for p in ordenados[:PREFILTRO_TOP]
            ]

        # Obtener todos los perfiles
        if hasattr(self.perfil_repo, "get_all"):
            perfiles = self.perfil_repo.get_all()
        else:
            from backend.infrastructure.persistence.models.perfil import PerfilModel
            perfiles = self.db.query(PerfilModel).all()

        candidatos = []
        for p in perfiles:
            skills_p = {_normalizar(s) for s in _safe_list(p, "skills") if _normalizar(s)}
            if not skills_p:
                continue

            match = requisitos & skills_p
            faltantes = requisitos - skills_p
            score_base = len(match) / len(requisitos) if requisitos else 0.0

            if score_base > 0:
                candidatos.append({
                    "perfil": p,
                    "score_base": score_base,
                    "skills_match": sorted(match),
                    "skills_faltantes": sorted(faltantes),
                })

        # Ordenar por score base, tomar top
        candidatos.sort(key=lambda c: c["score_base"], reverse=True)
        return candidatos[:PREFILTRO_TOP]

    def _vacante_dict(self, v) -> dict:
        return {
            "id": v.id,
            "titulo": _safe(v, "titulo"),
            "empresa": _safe(v, "empresa"),
            "ubicacion": _safe(v, "ubicacion"),
            "requisitos": [
                s.strip() for s in _safe(v, "requisitos").split(";") if s.strip()
            ],
        }

    def _invocar_llm(self, vacante, prefiltro: list[dict]) -> list[dict]:
        """Construye el prompt, invoca al LLM y parsea la respuesta JSON."""
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY no configurada en variables de entorno")

        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=api_key,
            temperature=0.3,
            max_tokens=2000,
        )

        # Preparar payload de candidatos para el LLM
        candidatos_payload = []
        for c in prefiltro:
            p = c["perfil"]
            candidatos_payload.append({
                "perfil_id": p.id,
                "nombre": _safe(p, "nombre_completo", "Sin nombre"),
                "email": _safe(p, "email"),
                "skills": _safe_list(p, "skills"),
                "skills_match": c["skills_match"],
                "skills_faltantes": c["skills_faltantes"],
                "score_base": round(c["score_base"] * 100, 1),
                "nivel_educativo": _safe(p, "nivel_educativo"),
                "titulo_educativo": _safe(p, "titulo_educativo"),
                "experiencia_anos": _safe(p, "experiencia_anos"),
                "cargo_actual": _safe(p, "cargo_actual"),
                "ubicacion": _safe(p, "ubicacion"),
            })

        vacante_payload = {
            "titulo": _safe(vacante, "titulo"),
            "empresa": _safe(vacante, "empresa"),
            "ubicacion": _safe(vacante, "ubicacion"),
            "modalidad": _safe(vacante, "modalidad"),
            "requisitos": [
                s.strip() for s in _safe(vacante, "requisitos").split(";") if s.strip()
            ],
            "descripcion": _safe(vacante, "descripcion"),
        }

        system = (
            "Eres un reclutador senior experto en evaluación de talento técnico. "
            "Tu trabajo es analizar candidatos para una vacante y producir un ranking "
            "objetivo y justificado. Eres riguroso, conciso y honesto: no inventas "
            "datos que no están en el perfil. Respondes siempre en español y "
            "exclusivamente en formato JSON válido, sin texto adicional ni explicaciones "
            "fuera del JSON."
        )

        user_prompt = f"""Analiza los siguientes candidatos para esta vacante y devuelve el TOP {RANKING_FINAL} ranqueado por mejor fit.

VACANTE:
{json.dumps(vacante_payload, ensure_ascii=False, indent=2)}

CANDIDATOS PRE-FILTRADOS (ya filtrados por coincidencia mínima de skills):
{json.dumps(candidatos_payload, ensure_ascii=False, indent=2)}

INSTRUCCIONES:
1. Considera: skills_match (skills que cubre), skills_faltantes (skills que le faltan), nivel educativo, experiencia y cargo actual.
2. Asigna un score de 0 a 100 (0 = no apto, 100 = match perfecto).
3. Sé honesto: si un candidato tiene huecos importantes, refléjalo en el score y en las debilidades.
4. Las fortalezas y debilidades deben ser ESPECÍFICAS, no genéricas. Menciona skills concretos, años de experiencia, instituciones, etc.
5. La explicación debe ser de 1-2 frases, profesional, sin adjetivos vacíos.

RESPONDE EXCLUSIVAMENTE CON ESTE JSON (sin texto fuera del JSON):
{{
  "ranking": [
    {{
      "perfil_id": "<id exacto del candidato>",
      "score": <entero 0-100>,
      "fortalezas": "<2-3 fortalezas concretas separadas por punto y coma>",
      "debilidades": "<1-2 debilidades concretas o 'Ninguna observable'>",
      "explicacion": "<por qué este candidato es el N° X del ranking, 1-2 frases>"
    }}
  ]
}}"""

        response = llm.invoke([
            SystemMessage(content=system),
            HumanMessage(content=user_prompt),
        ])

        raw = response.content if hasattr(response, "content") else str(response)
        parsed = self._extraer_json(raw)

        if "ranking" not in parsed or not isinstance(parsed["ranking"], list):
            raise ValueError("Respuesta del LLM sin formato esperado")

        # Mezclar info del LLM con datos del perfil
        perfiles_por_id = {c["perfil"].id: c for c in prefiltro}
        ranking_final = []
        for item in parsed["ranking"][:RANKING_FINAL]:
            pid = item.get("perfil_id")
            if pid not in perfiles_por_id:
                continue
            candidato = perfiles_por_id[pid]
            perfil = candidato["perfil"]
            ranking_final.append({
                "perfil_id": pid,
                "nombre": _safe(perfil, "nombre_completo", "Sin nombre"),
                "email": _safe(perfil, "email"),
                "score": int(item.get("score", 0)),
                "skills_match": candidato["skills_match"],
                "skills_faltantes": candidato["skills_faltantes"],
                "fortalezas": item.get("fortalezas", ""),
                "debilidades": item.get("debilidades", ""),
                "explicacion": item.get("explicacion", ""),
            })

        # Reordenar por score por si acaso
        ranking_final.sort(key=lambda r: r["score"], reverse=True)
        return ranking_final

    def _extraer_json(self, raw: str) -> dict:
        """Extrae JSON aunque venga envuelto en markdown o tenga prefijos."""
        # Quitar bloques de código markdown
        cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()

        # Encontrar el primer { y el último } balanceado
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1:
            raise ValueError(f"No se encontró JSON en la respuesta del LLM: {raw[:200]}")

        json_str = cleaned[start:end + 1]
        return json.loads(json_str)