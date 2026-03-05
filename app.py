import streamlit as st
from pathlib import Path

import pandas as pd
from src.agents.vacantes_pdf import pdf_to_vacantes_df, save_vacantes_csv
from src.agents.recomendacion_agent import recomendar_vacantes_desde_df

st.title("Bienvenido a JobAgent")

uploaded = st.file_uploader(
    "Sube un PDF con vacantes. Debe seguir esta estrutura: id,titulo,empresa,ubicacion,modalidad,descripcion,requisitos,url",
    type=["pdf"]
)

if uploaded is not None:
    # Streamlit da el archivo como bytes en memoria, no como ruta real  [oai_citation:1‡Streamlit](https://discuss.streamlit.io/t/uploading-a-csv-file-using-file-uploader/27227?utm_source=chatgpt.com)
    uploads_dir = Path("data/uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = uploads_dir / "vacantes.pdf"
    pdf_path.write_bytes(uploaded.getvalue())

    st.success(f"PDF guardado en: {pdf_path}")

    if st.button("Cargar vacantes desde el PDF"):
        try:
            df = pdf_to_vacantes_df(str(pdf_path))
            save_vacantes_csv(df, "data/vacantes.csv")

            st.success("Vacantes cargadas y guardadas en data/vacantes.csv")
            st.session_state["vacantes_df"] = df

        except Exception as e:
            st.error(f"Error cargando vacantes: {e}")


st.header("Ver detalle de vacante")

df = st.session_state.get("vacantes_df")
if df is None:
    # fallback: si ya existe el CSV
    csv_path = Path("data/vacantes.csv")
    if csv_path.exists():
        df = pd.read_csv(csv_path)

if df is not None and len(df) > 0:
    st.subheader("Lista de vacantes")
    st.dataframe(df[["id","titulo","empresa","ubicacion","modalidad"]], width="stretch")

    opciones = df.apply(lambda r: f"#{r['id']} - {r['titulo']} ({r['empresa']})", axis=1).tolist()
    choice = st.selectbox("Selecciona una vacante", opciones)

    selected_id = int(choice.split("-")[0].replace("#","").strip())
    row = df[df["id"] == selected_id].iloc[0]

    st.subheader("Detalle")
    st.markdown(f"**Título:** {row['titulo']}")
    st.markdown(f"**Empresa:** {row['empresa']}")
    st.markdown(f"**Ubicación:** {row['ubicacion']}")
    st.markdown(f"**Modalidad:** {row['modalidad']}")

    # Criterios de aceptación:
    st.markdown("### Descripción")
    st.write(row["descripcion"])

    st.markdown("### Requisitos")
    st.write(row["requisitos"])

else:
    st.info("Aún no hay vacantes cargadas. Sube un PDF y cárgalas primero.")

st.header("Vacantes recomendadas")

df = st.session_state.get("vacantes_df")
if df is None:
    csv_path = Path("data/vacantes.csv")
    if csv_path.exists():
        df = pd.read_csv(csv_path)

if df is not None and len(df) > 0:
    st.caption("Ingresa tus skills y verás recomendaciones basadas en coincidencias con los requisitos.")

    # Input simple (puedes cambiarlo a multiselect si quieres)
    skills_raw = st.text_input("Tus skills (separadas por coma)", value="python, sql")
    perfil_skills = [s.strip() for s in skills_raw.split(",") if s.strip()]

    if st.button("Generar recomendaciones"):
        rec_df = recomendar_vacantes_desde_df(perfil_skills, df)

        if len(rec_df) == 0:
            st.info("No hay recomendaciones para mostrar.")
        else:
            st.subheader("Ranking (mayor score = más match)")
            st.dataframe(
                rec_df[["id", "titulo", "empresa", "ubicacion", "modalidad", "score"]],
                width="stretch"
            )

            top = rec_df.iloc[0]
            st.markdown("### Mejor recomendación")
            st.markdown(f"**#{top['id']} - {top['titulo']} ({top['empresa']})**")
            st.write(f"Score: {top['score']}")
            st.write(top["descripcion"])
else:
    st.info("Primero carga vacantes desde el PDF para poder recomendar.")