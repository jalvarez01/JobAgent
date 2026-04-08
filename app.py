import streamlit as st
from pathlib import Path
from src.agents.cargar import load_document
from src.agents.analizar import analizar_cv

st.set_page_config(page_title="JobAgent", page_icon="💼")
st.title("💼 Bienvenido a JobAgent")
st.subheader("Sube y analiza tu hoja de vida")

uploaded = st.file_uploader(
    "Sube tu hoja de vida (pdf o docx)",
    type=["pdf", "docx"]
)

if uploaded is not None:
    nombre = uploaded.name

    uploads_dir = Path("data/uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    file_path = uploads_dir / nombre
    file_path.write_bytes(uploaded.getvalue())

    res = load_document(file_path)
    st.success("✅ Documento cargado exitosamente")

    if st.button("Solicitar análisis"):
        try:
            resultado = analizar_cv(res)
            st.write(resultado)

            resultados_dir = Path("storage")
            resultados_dir.mkdir(parents=True, exist_ok=True)

            archivos = list(resultados_dir.glob("analisis_*.txt"))
            contador = len(archivos) + 1

            out_path = resultados_dir / f"analisis_{contador}.txt"
            out_path.write_text(resultado, encoding="utf-8")
            st.success(f"Análisis guardado en: {out_path}")

        except Exception as e:
            st.error(f"Error analizando el CV: {e}")