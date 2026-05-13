import { useState, useEffect } from "react"
import { listarTodasPostulaciones, cambiarEstado } from "../api/postulaciones"

const ESTADOS = [
  { key: "postulado", label: "Postulado", color: "var(--info)", bg: "var(--info-bg)" },
  { key: "en_revision", label: "En revisión", color: "var(--warning)", bg: "var(--warning-bg)" },
  { key: "entrevista", label: "Entrevista", color: "#7c3aed", bg: "rgba(124, 58, 237, 0.1)" },
  { key: "oferta", label: "Oferta", color: "var(--success)", bg: "var(--success-bg)" },
  { key: "descartado", label: "Descartado", color: "var(--destructive)", bg: "var(--destructive-bg)" },
]

const TRANSICIONES = {
  postulado: ["en_revision", "descartado"],
  en_revision: ["entrevista", "descartado"],
  entrevista: ["oferta", "descartado"],
  oferta: ["descartado"],
  descartado: [],
}

export default function AdminPostulaciones({ onVolver }) {
  const [postulaciones, setPostulaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const data = await listarTodasPostulaciones()
      setPostulaciones(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstado(id, nuevoEstado)
      setMensaje(`Estado actualizado a "${ESTADOS.find(e => e.key === nuevoEstado)?.label}"`)
      setTimeout(() => setMensaje(""), 2500)
      await cargar()
    } catch (err) { alert(err.message) }
  }

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }) : ""

  const filtradas = postulaciones.filter(p => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (p.vacante_titulo || "").toLowerCase().includes(q)
      || (p.vacante_empresa || "").toLowerCase().includes(q)
      || (p.perfil_nombre || "").toLowerCase().includes(q)
      || (p.perfil_email || "").toLowerCase().includes(q)
  })

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Gestión de Postulaciones</h1>
          <p style={s.subtitle}>
            {postulaciones.length} postulación{postulaciones.length !== 1 ? "es" : ""} en el sistema
          </p>
        </div>
        {onVolver && (
          <button
            onClick={onVolver}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ← Volver
          </button>
        )}
      </div>

      {error && <div style={s.error}>{error}</div>}
      {mensaje && <div style={s.success}>{mensaje}</div>}

      <div style={s.searchRow}>
        <input
          placeholder="Buscar por candidato, vacante o empresa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /></div>
      ) : filtradas.length === 0 ? (
        <div style={s.empty}>
          <h3 style={s.emptyTitle}>
            {busqueda ? "No se encontraron postulaciones" : "Sin postulaciones en el sistema"}
          </h3>
          <p style={s.muted}>
            {busqueda ? "Intenta con otros términos" : "Las postulaciones aparecerán aquí cuando los candidatos se postulen."}
          </p>
        </div>
      ) : (
        <div style={s.kanban} className="animate-slide-up">
          {ESTADOS.map((estado) => {
            const cards = filtradas.filter((p) => p.estado === estado.key)
            return (
              <div key={estado.key} style={s.column}>
                <div style={s.columnHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...s.columnDot, background: estado.color }} />
                    <span style={s.columnTitle}>{estado.label}</span>
                  </div>
                  <span style={s.columnCount}>{cards.length}</span>
                </div>
                <div style={s.cards}>
                  {cards.map((p) => (
                    <PostulacionCard
                      key={p.id}
                      postulacion={p}
                      transiciones={TRANSICIONES[p.estado] || []}
                      onCambiarEstado={handleCambiarEstado}
                      fmtFecha={fmtFecha}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div style={s.emptyCol}>—</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PostulacionCard({ postulacion, transiciones, onCambiarEstado, fmtFecha }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div style={s.card}>
      {/* Candidato */}
      <div style={s.candidateRow}>
        <div style={s.candidateAvatar}>
          {(postulacion.perfil_nombre || "?").charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.candidateName}>{postulacion.perfil_nombre || "Sin nombre"}</div>
          <div style={s.candidateEmail}>{postulacion.perfil_email || "—"}</div>
        </div>
      </div>

      {/* Vacante */}
      <div style={s.vacanteBox}>
        <h4 style={s.cardTitle}>{postulacion.vacante_titulo || "Vacante"}</h4>
        <p style={s.cardEmpresa}>{postulacion.vacante_empresa}</p>
      </div>

      <div style={s.cardMeta}>
        <span style={s.cardTipo}>{postulacion.tipo}</span>
        {postulacion.score_match && (
          <span style={s.cardScore}>{postulacion.score_match}%</span>
        )}
      </div>

      <div style={s.cardFecha}>{fmtFecha(postulacion.created_at)}</div>

      {transiciones.length > 0 && (
        <div style={s.transiciones}>
          {!expandido ? (
            <button
              onClick={() => setExpandido(true)}
              style={s.cardBtnGhost}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cambiar estado
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {transiciones.map((nuevo) => {
                const est = ESTADOS.find((e) => e.key === nuevo)
                return (
                  <button
                    key={nuevo}
                    onClick={() => onCambiarEstado(postulacion.id, nuevo)}
                    style={{
                      ...s.cardBtnEstado,
                      color: est.color,
                      borderColor: est.color,
                    }}
                  >
                    → {est.label}
                  </button>
                )
              })}
              <button
                onClick={() => setExpandido(false)}
                style={s.cardBtnCancel}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
  heroRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 15,
    color: "var(--muted-foreground)",
  },
  muted: { color: "var(--muted-foreground)", fontSize: 15 },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  success: {
    color: "#1d7d3f",
    background: "var(--success-bg)",
    border: "1px solid rgba(52, 199, 89, 0.25)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  loading: { display: "flex", justifyContent: "center", padding: 80 },
  spinner: {
    width: 28, height: 28,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center",
    padding: 80,
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  kanban: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 12,
    overflowX: "auto",
  },
  column: {
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-lg)",
    padding: 14,
    minHeight: 400,
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    padding: "0 4px",
  },
  columnDot: {
    width: 8, height: 8,
    borderRadius: "50%",
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    letterSpacing: "-0.005em",
  },
  columnCount: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--muted-foreground)",
    background: "rgba(0,0,0,0.05)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
  },
  cards: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyCol: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    textAlign: "center",
    padding: "32px 8px",
  },
  card: {
    background: "var(--card-solid)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: 14,
    boxShadow: "var(--shadow-xs)",
  },
  candidateRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--border)",
  },
  candidateAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  candidateName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 1,
    letterSpacing: "-0.005em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  candidateEmail: {
    fontSize: 10,
    color: "var(--muted-foreground)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  vacanteBox: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
    letterSpacing: "-0.005em",
    lineHeight: 1.3,
  },
  cardEmpresa: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  cardMeta: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  cardTipo: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    padding: "2px 8px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
  },
  cardScore: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--primary)",
    padding: "2px 8px",
    background: "var(--accent)",
    borderRadius: "var(--radius-full)",
  },
  cardFecha: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    marginBottom: 10,
  },
  transiciones: {
    marginTop: 8,
    paddingTop: 10,
    borderTop: "1px solid var(--border)",
  },
  cardBtnGhost: {
    width: "100%",
    padding: "7px 12px",
    background: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--foreground)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  cardBtnEstado: {
    padding: "7px 12px",
    background: "transparent",
    border: "1px solid",
    borderRadius: "var(--radius-sm)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  cardBtnCancel: {
    padding: "6px 12px",
    background: "transparent",
    border: "none",
    fontSize: 11,
    color: "var(--muted-foreground)",
    cursor: "pointer",
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
}