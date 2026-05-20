import csv
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session
from backend.infrastructure.persistence.models.vacante import VacanteModel


class VacanteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        estado: str = "activa",
        area: Optional[str] = None,
    ) -> list[VacanteModel]:
        query = self.db.query(VacanteModel).filter(VacanteModel.estado == estado)
        if area:
            query = query.filter(VacanteModel.area == area)
        return query.all()

    def get_by_id(self, vacante_id: str) -> Optional[VacanteModel]:
        return self.db.query(VacanteModel).filter(VacanteModel.id == vacante_id).first()

    def search(self, query: str, area: Optional[str] = None) -> list[VacanteModel]:
        pattern = f"%{query.lower()}%"
        q = self.db.query(VacanteModel).filter(
            (VacanteModel.titulo.ilike(pattern))
            | (VacanteModel.empresa.ilike(pattern))
            | (VacanteModel.descripcion.ilike(pattern))
            | (VacanteModel.requisitos.ilike(pattern))
        )
        if area:
            q = q.filter(VacanteModel.area == area)
        return q.all()

    def count(self) -> int:
        return self.db.query(VacanteModel).count()

    def get_all_any_estado(self) -> list[VacanteModel]:
        """Retorna todas las vacantes sin filtrar por estado (para admin)."""
        return self.db.query(VacanteModel).order_by(VacanteModel.created_at.desc()).all()

    def get_areas_disponibles(self) -> list[str]:
        """Retorna las áreas únicas presentes en la BD."""
        result = (
            self.db.query(VacanteModel.area)
            .filter(VacanteModel.area.isnot(None))
            .filter(VacanteModel.estado == "activa")
            .distinct()
            .all()
        )
        return sorted([r[0] for r in result if r[0]])

    def create(self, data: dict) -> VacanteModel:
        vacante = VacanteModel(**data)
        self.db.add(vacante)
        self.db.commit()
        self.db.refresh(vacante)
        return vacante

    def update(self, vacante_id: str, data: dict) -> Optional[VacanteModel]:
        vacante = self.get_by_id(vacante_id)
        if not vacante:
            return None
        for field, value in data.items():
            setattr(vacante, field, value)
        self.db.commit()
        self.db.refresh(vacante)
        return vacante

    def delete(self, vacante_id: str) -> bool:
        vacante = self.get_by_id(vacante_id)
        if not vacante:
            return False
        self.db.delete(vacante)
        self.db.commit()
        return True

    def seed_from_csv(self, csv_path: str | Path) -> int:
        """Carga vacantes desde CSV si la tabla está vacía. Retorna cantidad insertada."""
        if self.count() > 0:
            return 0

        csv_path = Path(csv_path)
        if not csv_path.exists():
            return 0

        count = 0
        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                vacante = VacanteModel(
                    id=row.get("id", "").strip(),
                    titulo=row.get("titulo", "").strip(),
                    empresa=row.get("empresa", "").strip(),
                    ubicacion=row.get("ubicacion", "").strip() or None,
                    modalidad=row.get("modalidad", "").strip() or None,
                    salario_min=float(row["salario_min"]) if row.get("salario_min") else None,
                    salario_max=float(row["salario_max"]) if row.get("salario_max") else None,
                    descripcion=row.get("descripcion", "").strip() or None,
                    requisitos=row.get("requisitos", "").strip() or None,
                    url=row.get("url", "").strip() or None,
                    estado=row.get("estado", "activa").strip(),
                    area=row.get("area", "").strip() or None,
                )
                self.db.add(vacante)
                count += 1
        self.db.commit()
        return count