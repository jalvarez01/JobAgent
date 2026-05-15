import { useState, useEffect } from "react"
import { listarPostulaciones, obtenerTrazas } from "../api/postulaciones"

const ESTADOS = [
  { key: "postulado", label: "Postulado", color: "var(--info)" },
  { key: "en_revision", label: "En revisión", color: "var(--warning)" },
  { key: "entrevista", label: "Entrevista", color: "#7c3aed" },
  { key: "oferta", label: "Oferta", color: "var(--success)" },
  { key: "descartado", label: "Descartado", color: "var(--destructive)" },
]

export default function Tablero({ perfil, onVolver }) {
  const [postulaciones, setPostulaciones] = useState([])
  const [trazas, setTrazas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [vista, setVista] = useState("kanban")

  useEffect(() => {
    if (perfil?.id) cargar()
  }, [perfil?.id])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const [posts, trz] = await Promise.all([
        listarPostulaciones(perfil.id),
        obtenerTrazas(perfil.id),
      ])
      setPostulaciones(posts)
      setTrazas(trz)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }) : ""

  const fmtFechaCompleta = (f) => f ? new Date(f).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : ""

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Tablero</h1>
          <p style={s.subtitle}>
            {postulaciones.length} postulación{postulaciones.length !== 1 ? "es" : ""} en seguimiento
          </p>
          <p style={s.hint}>
            Los cambios de estado son gestionados por el equipo de reclutamiento.
          </p>
        </div>
        {onVolver && (
          <button
            onClick={onVolver}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ← Mi perfil
          </button>
        )}
      </div>

      {/* Segmented control */}
      <div style={s.segmented}>
        <button
          onClick={() => setVista("kanban")}
          style={{
            ...s.segmentBtn,
            background: vista === "kanban" ? "var(--card-solid)" : "transparent",
            color: vista === "kanban" ? "var(--foreground)" : "var(--muted-foreground)",
            boxShadow: vista === "kanban" ? "var(--shadow-xs)" : "none",
          }}
        >
          Tablero
        </button>
        <button
          onClick={() => setVista("historial")}
          style={{
            ...s.segmentBtn,
            background: vista === "historial" ? "var(--card-solid)" : "transparent",
            color: vista === "historial" ? "var(--foreground)" : "var(--muted-foreground)",
            boxShadow: vista === "historial" ? "var(--shadow-xs)" : "none",
          }}
        >
          Historial
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /></div>
      ) : vista === "kanban" ? (
        postulaciones.length === 0 ? (
          <div style={s.empty}>
            <h3 style={s.emptyTitle}>Sin postulaciones aún</h3>
            <p style={s.muted}>
              Cuando te postules a una vacante, aparecerá aquí para hacer seguimiento de su estado.
            </p>
          </div>
        ) : (
          <div style={s.kanban} className="animate-slide-up">
            {ESTADOS.map((estado) => {
              const cards = postulaciones.filter((p) => p.estado === estado.key)
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
                      <div key={p.id} style={s.card}>
                        <h4 style={s.cardTitle}>{p.vacante_titulo || "Vacante"}</h4>
                        <p style={s.cardEmpresa}>{p.vacante_empresa}</p>
                        <div style={s.cardMeta}>
                          <span style={s.cardTipo}>{p.tipo}</span>
                          {p.score_match && (
                            <span style={s.cardScore}>{p.score_match}%</span>
                          )}
                        </div>
                        <div style={s.cardFecha}>{fmtFecha(p.created_at)}</div>
                      </div>
                    ))}
                    {cards.length === 0 && (
                      <div style={s.emptyCol}>—</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        <div className="animate-slide-up">
          {trazas.length === 0 ? (
            <div style={s.empty}>
              <h3 style={s.emptyTitle}>Sin actividad registrada</h3>
              <p style={s.muted}>El historial aparecerá aquí cuando tengas postulaciones.</p>
            </div>
          ) : (
            <div style={s.timeline}>
              {trazas.map((t, i) => (
                <div key={t.id} style={s.timelineItem}>
                  <div style={s.timelineDot} />
                  {i < trazas.length - 1 && <div style={s.timelineLine} />}
                  <div style={s.timelineCard}>
                    <div style={s.timelineHeader}>
                      <span style={s.timelineTipo}>{t.tipo}</span>
                      <span style={s.timelineFecha}>{fmtFechaCompleta(t.created_at)}</span>
                    </div>
                    <p style={s.timelineDesc}>{t.descripcion}</p>
                    {t.origen && (
                      <span style={s.timelineOrigen}>Origen: {t.origen}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  container: {
    maxWidth: 1180,
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
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 12,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    fontStyle: "italic",
    opacity: 0.8,
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
  segmented: {
    display: "inline-flex",
    padding: 4,
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-md)",
    marginBottom: 28,
    gap: 2,
  },
  segmentBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
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
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 4,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
  },
  cardEmpresa: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginBottom: 10,
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
  },
  timeline: {
    position: "relative",
    paddingLeft: 32,
  },
  timelineItem: {
    position: "relative",
    paddingBottom: 24,
  },
  timelineDot: {
    position: "absolute",
    left: -32,
    top: 6,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "var(--primary)",
    border: "3px solid var(--background)",
    boxShadow: "0 0 0 1px var(--border)",
    zIndex: 1,
  },
  timelineLine: {
    position: "absolute",
    left: -26,
    top: 22,
    bottom: -8,
    width: 2,
    background: "var(--border-strong)",
  },
  timelineCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  timelineTipo: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    textTransform: "capitalize",
  },
  timelineFecha: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  timelineDesc: {
    fontSize: 15,
    color: "var(--foreground)",
    lineHeight: 1.5,
    marginBottom: 8,
  },
  timelineOrigen: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    padding: "2px 8px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
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