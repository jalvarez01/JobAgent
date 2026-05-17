"""Generador de CV en PDF con diseño profesional usando reportlab."""
from io import BytesIO
from typing import Any

from sqlalchemy.orm import Session

from backend.infrastructure.persistence.repositories.perfil_repo import PerfilRepository


def _safe(obj, attr, default=""):
    """Obtiene atributo con fallback seguro y devuelve string."""
    value = getattr(obj, attr, None)
    if value is None:
        return default
    return str(value)


def _safe_list(obj, attr) -> list:
    """Obtiene un atributo como lista, sea que esté serializado JSON o ya sea lista."""
    value = getattr(obj, attr, None)
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        import json
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


class CVPDFService:
    def __init__(self, db: Session):
        self.db = db
        self.perfil_repo = PerfilRepository(db)

    def validar_completitud(self, perfil) -> dict:
        """Verifica que el perfil tenga los campos mínimos para generar un CV decente."""
        faltantes = []

        if not _safe(perfil, "nombre_completo"):
            faltantes.append("Nombre completo")
        if not _safe(perfil, "email"):
            faltantes.append("Email")

        skills = _safe_list(perfil, "skills")
        if not skills:
            faltantes.append("Al menos un skill")

        # Educación o experiencia (al menos uno)
        tiene_educacion = bool(_safe(perfil, "nivel_educativo") or _safe_list(perfil, "educacion"))
        tiene_experiencia = bool(_safe_list(perfil, "experiencia"))
        if not tiene_educacion and not tiene_experiencia:
            faltantes.append("Educación o experiencia")

        return {
            "completo": len(faltantes) == 0,
            "faltantes": faltantes,
        }

    def verificar_perfil(self, perfil_id: str) -> dict:
        """Devuelve el estado de completitud sin generar PDF."""
        perfil = self.perfil_repo.get_by_id(perfil_id)
        if not perfil:
            raise ValueError("Perfil no encontrado")
        return self.validar_completitud(perfil)

    def generar_pdf(self, perfil_id: str) -> tuple[bytes, str]:
        """Genera el PDF del CV. Devuelve (bytes, filename)."""
        perfil = self.perfil_repo.get_by_id(perfil_id)
        if not perfil:
            raise ValueError("Perfil no encontrado")

        validacion = self.validar_completitud(perfil)
        if not validacion["completo"]:
            raise ValueError(
                f"Perfil incompleto. Faltan: {', '.join(validacion['faltantes'])}"
            )

        pdf_bytes = self._construir_documento(perfil)
        nombre = _safe(perfil, "nombre_completo", "candidato").strip()
        slug = "_".join(nombre.split())
        filename = f"CV_{slug}.pdf"

        return pdf_bytes, filename

    def _construir_documento(self, perfil: Any) -> bytes:
        """Crea el PDF usando reportlab con un layout profesional."""
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.lib.enums import TA_LEFT
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
        )

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=1.8 * cm,
            rightMargin=1.8 * cm,
            topMargin=1.8 * cm,
            bottomMargin=1.8 * cm,
        )

        # Colores estilo Apple discreto
        color_text = colors.HexColor("#1d1d1f")
        color_muted = colors.HexColor("#6e6e73")
        color_accent = colors.HexColor("#0071e3")
        color_line = colors.HexColor("#d2d2d7")

        styles = getSampleStyleSheet()

        style_nombre = ParagraphStyle(
            "Nombre", parent=styles["Title"],
            fontName="Helvetica-Bold", fontSize=24, leading=28,
            textColor=color_text, alignment=TA_LEFT, spaceAfter=4,
        )
        style_subtitulo = ParagraphStyle(
            "Subtitulo", parent=styles["Normal"],
            fontName="Helvetica", fontSize=11, leading=14,
            textColor=color_muted, spaceAfter=4,
        )
        style_contacto = ParagraphStyle(
            "Contacto", parent=styles["Normal"],
            fontName="Helvetica", fontSize=10, leading=14,
            textColor=color_muted, spaceAfter=12,
        )
        style_seccion = ParagraphStyle(
            "Seccion", parent=styles["Heading2"],
            fontName="Helvetica-Bold", fontSize=12, leading=16,
            textColor=color_accent, spaceBefore=14, spaceAfter=8,
            textTransform="uppercase",
        )
        style_item_titulo = ParagraphStyle(
            "ItemTitulo", parent=styles["Normal"],
            fontName="Helvetica-Bold", fontSize=11, leading=14,
            textColor=color_text, spaceAfter=2,
        )
        style_item_meta = ParagraphStyle(
            "ItemMeta", parent=styles["Normal"],
            fontName="Helvetica-Oblique", fontSize=10, leading=13,
            textColor=color_muted, spaceAfter=4,
        )
        style_body = ParagraphStyle(
            "Body", parent=styles["Normal"],
            fontName="Helvetica", fontSize=10.5, leading=15,
            textColor=color_text, spaceAfter=8,
        )
        style_skill = ParagraphStyle(
            "Skill", parent=styles["Normal"],
            fontName="Helvetica", fontSize=10, leading=13,
            textColor=color_text,
        )

        story = []

        # ====== HEADER: Nombre + contacto ======
        story.append(Paragraph(_safe(perfil, "nombre_completo", "Sin nombre"), style_nombre))

        cargo_actual = _safe(perfil, "cargo_actual") or _safe(perfil, "titulo_actual") or ""
        if cargo_actual:
            story.append(Paragraph(cargo_actual, style_subtitulo))

        contacto_parts = []
        email = _safe(perfil, "email")
        telefono = _safe(perfil, "telefono")
        ubicacion = _safe(perfil, "ubicacion") or _safe(perfil, "ciudad")
        linkedin = _safe(perfil, "linkedin_url") or _safe(perfil, "linkedin")
        if email: contacto_parts.append(email)
        if telefono: contacto_parts.append(telefono)
        if ubicacion: contacto_parts.append(ubicacion)
        if linkedin: contacto_parts.append(linkedin)

        if contacto_parts:
            story.append(Paragraph(" · ".join(contacto_parts), style_contacto))

        story.append(HRFlowable(width="100%", thickness=0.5, color=color_line, spaceBefore=4, spaceAfter=4))

        # ====== RESUMEN / BIO ======
        bio = _safe(perfil, "biografia") or _safe(perfil, "resumen") or _safe(perfil, "descripcion")
        if bio:
            story.append(Paragraph("Resumen", style_seccion))
            story.append(Paragraph(bio, style_body))

        # ====== EXPERIENCIA ======
        experiencias = _safe_list(perfil, "experiencia")
        if experiencias:
            story.append(Paragraph("Experiencia", style_seccion))
            for exp in experiencias:
                if not isinstance(exp, dict):
                    continue
                cargo = exp.get("cargo") or exp.get("puesto") or exp.get("titulo") or "Sin cargo"
                empresa = exp.get("empresa") or exp.get("organizacion") or ""
                periodo = exp.get("periodo") or exp.get("fechas") or ""
                descripcion = exp.get("descripcion") or exp.get("logros") or ""

                titulo_linea = cargo
                if empresa:
                    titulo_linea += f" — {empresa}"
                story.append(Paragraph(titulo_linea, style_item_titulo))
                if periodo:
                    story.append(Paragraph(periodo, style_item_meta))
                if descripcion:
                    story.append(Paragraph(descripcion, style_body))

        # ====== EDUCACIÓN ======
        educaciones = _safe_list(perfil, "educacion")
        nivel = _safe(perfil, "nivel_educativo")
        if educaciones or nivel:
            story.append(Paragraph("Educación", style_seccion))

            if educaciones:
                for edu in educaciones:
                    if not isinstance(edu, dict):
                        continue
                    titulo = edu.get("titulo") or edu.get("programa") or edu.get("carrera") or "Sin título"
                    institucion = edu.get("institucion") or edu.get("universidad") or ""
                    periodo = edu.get("periodo") or edu.get("fechas") or ""

                    linea = titulo
                    if institucion:
                        linea += f" — {institucion}"
                    story.append(Paragraph(linea, style_item_titulo))
                    if periodo:
                        story.append(Paragraph(periodo, style_item_meta))
                    story.append(Spacer(1, 4))
            elif nivel:
                story.append(Paragraph(f"Nivel educativo: {nivel}", style_body))

        # ====== SKILLS ======
        skills = _safe_list(perfil, "skills")
        if skills:
            story.append(Paragraph("Habilidades", style_seccion))

            # Skills en una tabla de 3 columnas tipo grid
            cell_style = ParagraphStyle(
                "SkillCell", parent=style_skill,
                fontName="Helvetica", fontSize=10, leading=13,
                textColor=color_text, leftIndent=6, rightIndent=6,
            )
            cells = [Paragraph(f"• {str(sk).capitalize()}", cell_style) for sk in skills]
            cols = 3
            rows_data = [cells[i:i + cols] for i in range(0, len(cells), cols)]
            # Padding con celdas vacías para que la última fila quede uniforme
            for row in rows_data:
                while len(row) < cols:
                    row.append(Paragraph("", cell_style))

            tabla = Table(rows_data, colWidths=[5.5 * cm, 5.5 * cm, 5.5 * cm])
            tabla.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(tabla)

        # ====== IDIOMAS ======
        idiomas = _safe_list(perfil, "idiomas")
        if idiomas:
            story.append(Paragraph("Idiomas", style_seccion))
            for idioma in idiomas:
                if isinstance(idioma, dict):
                    nombre_idi = idioma.get("idioma") or idioma.get("nombre") or ""
                    nivel_idi = idioma.get("nivel") or ""
                    linea = nombre_idi
                    if nivel_idi:
                        linea += f" — {nivel_idi}"
                    story.append(Paragraph(linea, style_body))
                else:
                    story.append(Paragraph(str(idioma), style_body))

        # ====== Footer discreto ======
        story.append(Spacer(1, 0.5 * cm))
        story.append(HRFlowable(width="100%", thickness=0.3, color=color_line))
        story.append(Spacer(1, 4))
        footer_style = ParagraphStyle(
            "Footer", parent=styles["Normal"],
            fontName="Helvetica", fontSize=8, leading=10,
            textColor=color_muted, alignment=TA_LEFT,
        )
        story.append(Paragraph("Generado con JobAgent · Magneto365 Profile Manager", footer_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.read()