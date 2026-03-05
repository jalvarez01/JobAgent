from __future__ import annotations

from typing import List, Dict
import pandas as pd


def _normalize_skills(skills: List[str]) -> List[str]:
    return [s.strip().lower() for s in skills if s and s.strip()]


def recomendar_vacantes_desde_df(perfil_skills: List[str], vacantes_df: pd.DataFrame) -> pd.DataFrame:
    """
    Recibe skills del usuario y el DF de vacantes.
    Devuelve un DF con 'score' (coincidencias) ordenado desc.

    Asume que vacantes_df tiene columna 'requisitos' en formato tipo:
      "python; sql; git; apis"
    """
    if vacantes_df is None or len(vacantes_df) == 0:
        return pd.DataFrame()

    perfil = set(_normalize_skills(perfil_skills))

    def score_row(reqs: str) -> int:
        if not isinstance(reqs, str):
            return 0
        req_list = [x.strip().lower() for x in reqs.split(";") if x.strip()]
        return len(perfil.intersection(req_list))

    df = vacantes_df.copy()
    df["score"] = df["requisitos"].apply(score_row)
    df = df.sort_values(by=["score", "id"], ascending=[False, True]).reset_index(drop=True)
    return df