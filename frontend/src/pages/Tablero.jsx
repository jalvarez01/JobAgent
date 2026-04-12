import { useState, useEffect } from "react"
import { listarPostulaciones, cambiarEstado, obtenerTrazas } from "../api/postulaciones"

const COLUMNAS = [
  { key: "postulado", label: "Postulado", color: "#3b82f6" },
  { key: "en_revision", label: "En revisión", color: "#8b5cf6" },
  { key: "entrevista", label: "Entrevista", color: "#f59e0b" },
  { key: "oferta", label: "Oferta", color: "#10b981" },
  { key: "descartado", label: "Descartado", color: "#ef4444" },
]

export default function Tablero({ perfil, onVolver }) {
  const [postulaciones, setPostulaciones] = useState([])
  const [trazas, setTrazas] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState("tablero") // "tablero" | "historial"

  useEffect(() => {
    if (perfil?.id) cargarDatos()
  }, [perfil?.id])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [posts, logs] = await Promise.all([
        listarPostulaciones(perfil.id),
        obtenerTrazas(perfil.id, 30),
      ])
      setPostulaciones(posts)
      setTrazas(logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (postId, nuevoEstado) => {
    try {
      await cambiarEstado(postId, nuevoEstado)
      await cargarDatos()
    } catch (err) {
      alert(err.message)
    }
  }

  const postulacionesPorEstado = (estado) =>
    postulaciones.filter((p) => p.estado === estado)

  const formatFecha = (fecha) => {
    if (!fecha) return ""
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: "center", color: "#999", padding: 40 }}>Cargando tablero...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Tablero de seguimiento</h2>
        <div style={styles.headerActions}>
          <button
            onClick={() => setVista(vista === "tablero" ? "historial" : "tablero")}
            style={styles.btnTab}
          >
            {vista === "tablero" ? "Ver historial" : "Ver tablero"}
          </button>
          <button onClick={onVolver} style={styles.btnSecundario}>← Volver</button>
        </div>
      </div>

      {postulaciones.length === 0 ? (
        <div style={styles.empty}>
          <p>No tienes postulaciones aún.</p>
          <p style={{ fontSize: 14, color: "#999" }}>
            Postúlate a vacantes desde las recomendaciones o ejecuta el pipeline automático.
          </p>
        </div>
      ) : vista === "tablero" ? (
        /* ─── Vista Kanban ─── */
        <div style={styles.kanban}>
          {COLUMNAS.map((col) => {
            const items = postulacionesPorEstado(col.key)
            return (
              <div key={col.key} style={styles.columna}>
                <div style={{ ...styles.columnaHeader, borderTopColor: col.color }}>
                  <span style={styles.columnaLabel}>{col.label}</span>
                  <span style={styles.columnaBadge}>{items.length}</span>
                </div>
                <div style={styles.columnaBody}>
                  {items.map((p) => (
                    <div key={p.id} style={styles.card}>
                      <p style={styles.cardTitle}>{p.vacante_titulo || "Vacante"}</p>
                      <p style={styles.cardEmpresa}>{p.vacante_empresa || ""}</p>
                      {p.score_match && (
                        <span style={styles.scorePill}>{p.score_match}% match</span>
                      )}
                      <p style={styles.cardTipo}>
                        {p.tipo === "auto" ? "Autopostulación" : "Manual"}
                      </p>
                      <p style={styles.cardFecha}>{formatFecha(p.created_at)}</p>

                      {/* Acciones de cambio de estado */}
                      <div style={styles.cardActions}>
                        {col.key === "postulado" && (
                          <button
                            onClick={() => handleCambiarEstado(p.id, "en_revision")}
                            style={styles.btnMini}
                          >
                            → En revisión
                          </button>
                        )}
                        {col.key === "en_revision" && (
                          <button
                            onClick={() => handleCambiarEstado(p.id, "entrevista")}
                            style={styles.btnMini}
                          >
                            → Entrevista
                          </button>
                        )}
                        {col.key === "entrevista" && (
                          <button
                            onClick={() => handleCambiarEstado(p.id, "oferta")}
                            style={{ ...styles.btnMini, background: "#d1fae5", color: "#065f46" }}
                          >
                            → Oferta
                          </button>
                        )}
                        {!["oferta", "descartado"].includes(col.key) && (
                          <button
                            onClick={() => handleCambiarEstado(p.id, "descartado")}
                            style={{ ...styles.btnMini, background: "#fee2e2", color: "#991b1b" }}
                          >
                            Descartar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── Vista Historial ─── */
        <div style={styles.historial}>
          {trazas.length === 0 ? (
            <p style={{ color: "#999" }}>Sin actividad registrada.</p>
          ) : (
            trazas.map((t) => (
              <div key={t.id} style={styles.trazaItem}>
                <div style={styles.trazaDot} />
                <div style={{ flex: 1 }}>
                  <p style={styles.trazaDesc}>{t.descripcion}</p>
                  <p style={styles.trazaMeta}>
                    {t.origen} · {formatFecha(t.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "24px 16px",
    textAlign: "left",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  headerActions: { display: "flex", gap: 8 },
  btnSecundario: {
    padding: "6px 14px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  btnTab: {
    padding: "6px 14px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  empty: { textAlign: "center", padding: 40, color: "#6b7280" },
  kanban: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 8,
  },
  columna: {
    flex: "1 0 170px",
    minWidth: 170,
    background: "#f9fafb",
    borderRadius: 8,
    overflow: "hidden",
  },
  columnaHeader: {
    padding: "10px 12px",
    borderTop: "3px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnaLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  columnaBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    background: "#e5e7eb",
    padding: "1px 7px",
    borderRadius: 10,
  },
  columnaBody: {
    padding: "8px 8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 80,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, margin: 0, color: "#111827" },
  cardEmpresa: { fontSize: 12, color: "#6b7280", margin: "2px 0 4px" },
  scorePill: {
    fontSize: 11,
    color: "#065f46",
    background: "#d1fae5",
    padding: "1px 6px",
    borderRadius: 8,
    display: "inline-block",
    marginBottom: 4,
  },
  cardTipo: { fontSize: 11, color: "#9ca3af", margin: "2px 0" },
  cardFecha: { fontSize: 11, color: "#9ca3af", margin: 0 },
  cardActions: { display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" },
  btnMini: {
    fontSize: 11,
    padding: "3px 8px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  historial: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderLeft: "2px solid #e5e7eb",
    marginLeft: 12,
    paddingLeft: 20,
  },
  trazaItem: {
    display: "flex",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
    position: "relative",
  },
  trazaDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#3b82f6",
    flexShrink: 0,
    marginTop: 5,
    position: "absolute",
    left: -25,
  },
  trazaDesc: { fontSize: 14, margin: 0, color: "#374151" },
  trazaMeta: { fontSize: 12, margin: "2px 0 0", color: "#9ca3af" },
}
