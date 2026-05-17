import { useState } from "react"
import { validarPerfilParaCV, descargarCVPDF } from "../api/cvExport"

/**
 * Botón para exportar el perfil del usuario como CV en PDF.
 * Valida primero la completitud y, si falta info, abre un modal sugiriendo qué completar.
 *
 * Uso: <BtnExportarCV perfilId={perfil.id} />
 */
export default function BtnExportarCV({ perfilId, onEditar }) {
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [faltantes, setFaltantes] = useState(null)

  const handleExportar = async () => {
    if (!perfilId) return
    setLoading(true)
    setMensaje("")
    setFaltantes(null)
    try {
      const validacion = await validarPerfilParaCV(perfilId)
      if (!validacion.completo) {
        setFaltantes(validacion.faltantes)
        return
      }
      const { filename } = await descargarCVPDF(perfilId)
      setMensaje(`Descargado: ${filename}`)
      setTimeout(() => setMensaje(""), 3500)
    } catch (err) {
      setMensaje(err.message)
      setTimeout(() => setMensaje(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleExportar}
        disabled={loading}
        style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {loading ? "Generando PDF..." : "Exportar como PDF"}
      </button>

      {mensaje && (
        <div style={s.toast} className="animate-fade-in" role="status">
          {mensaje}
        </div>
      )}

      {faltantes && (
        <div style={s.modalOverlay} onClick={() => setFaltantes(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
            <h2 style={s.modalTitle}>Perfil incompleto</h2>
            <p style={s.modalText}>
              Para generar un CV completo necesitas agregar la siguiente información a tu perfil:
            </p>
            <ul style={s.list}>
              {faltantes.map((item) => (
                <li key={item} style={s.listItem}>{item}</li>
              ))}
            </ul>
            <div style={s.modalActions}>
              <button
                onClick={() => setFaltantes(null)}
                style={s.btnSecondary}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Cerrar
              </button>
              {onEditar && (
                <button
                  onClick={() => { setFaltantes(null); onEditar() }}
                  style={s.btnPrimary}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                >
                  Editar perfil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const s = {
  btn: {
    padding: "11px 22px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--foreground)",
    color: "var(--background)",
    padding: "10px 20px",
    borderRadius: "var(--radius-full)",
    fontSize: 14,
    fontWeight: 500,
    zIndex: 200,
    boxShadow: "var(--shadow-lg)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: "var(--card-solid)",
    padding: 32,
    maxWidth: 460,
    width: "100%",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 8,
    color: "var(--foreground)",
  },
  modalText: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
    marginBottom: 16,
  },
  list: {
    margin: "0 0 24px 20px",
    padding: 0,
  },
  listItem: {
    fontSize: 14,
    color: "var(--foreground)",
    marginBottom: 6,
    lineHeight: 1.5,
  },
  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  btnSecondary: {
    padding: "11px 22px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  btnPrimary: {
    padding: "11px 22px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
}