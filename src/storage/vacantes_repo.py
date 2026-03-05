from __future__ import annotations

from pathlib import Path
import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "vacantes.csv"

def cargar_vacantes() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"No existe el archivo: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    if "id" not in df.columns:
        raise ValueError("El CSV debe tener una columna 'id'.")
    return df

def obtener_vacante_por_id(vacante_id: int) -> dict | None:
    df = cargar_vacantes()
    fila = df[df["id"] == vacante_id]
    if fila.empty:
        return None
    return fila.iloc[0].to_dict()