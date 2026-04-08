import streamlit as st
from pathlib import Path
import pandas as pd
from src.agents.vacantes_pdf import pdf_to_vacantes_df, save_vacantes_csv

st.set_page_config(page_title="Vacantes", page_icon="📄")
st.title("📄 Gestión de Vacantes")

# ── Sección: subir PDF de vacantes ──────────────────────────────

# ── Sección: ver detalle de vacante ─────────────────────────────
st.header("Ver detalle de vacante")

df = st.session_state.get("vacantes_df")
if df is None:
    csv_path = Path("data/vacantes.csv")
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        st.session_state["vacantes_df"] = df

if df is not None and len(df) > 0:
    st.subheader("Lista de vacantes")
    st.dataframe(
        df[["id", "titulo", "empresa", "ubicacion", "modalidad"]],
        use_container_width=True
    )

    opciones = df.apply(
        lambda r: f"#{r['id']} - {r['titulo']} ({r['empresa']})", axis=1
    ).tolist()
    choice = st.selectbox("Selecciona una vacante para ver el detalle", opciones)

    selected_id = int(choice.split("-")[0].replace("#", "").strip())
    row = df[df["id"] == selected_id].iloc[0]

    st.subheader("Detalle")
    st.markdown(f"**Título:** {row['titulo']}")
    st.markdown(f"**Empresa:** {row['empresa']}")
    st.markdown(f"**Ubicación:** {row['ubicacion']}")
    st.markdown(f"**Modalidad:** {row['modalidad']}")
    st.markdown("### Descripción")
    st.write(row["descripcion"])
    st.markdown("### Requisitos")
    st.write(row["requisitos"])
else:
    st.info("Aún no hay vacantes cargadas. Sube un PDF primero.")


    '''
st.header("Cargar vacantes desde PDF")

uploaded_pdf = st.file_uploader(
    "Sube el PDF con las vacantes",
    type=["pdf"]
)

if uploaded_pdf is not None:
    pdf_dir = Path("data")
    pdf_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = pdf_dir / uploaded_pdf.name
    pdf_path.write_bytes(uploaded_pdf.getvalue())
    st.success(f"PDF guardado en: {pdf_path}")

    if st.button("Cargar vacantes desde el PDF"):
        try:
            df = pdf_to_vacantes_df(str(pdf_path))
            save_vacantes_csv(df, "data/vacantes.csv")
            st.success("✅ Vacantes cargadas y guardadas en data/vacantes.csv")
            st.session_state["vacantes_df"] = df
        except Exception as e:
            st.error(f"Error cargando vacantes: {e}")
'''