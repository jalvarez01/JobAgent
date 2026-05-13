import { useState, useEffect } from "react"
import { listarEntrevistasPorPerfil } from "../api/entrevistas"

const TIPO_LABEL = {
  tecnica: "Técnica", hr: "Recursos Humanos", final: "Final", cultural: "Cultural",
}
const ESTADO_LABEL = {
  programada: "Programada", completada: "Completada", cancelada: "Cancelada",
}
const NIVEL_LABEL = {
  excelente: "Excelente", bueno: "Bueno", regular: "Regular", debil: "Débil",
}

const CATEGORIAS = [
  { key: "puntaje_tecnico", label: "Habilidades técnicas" },
  { key: "puntaje_comunicacion", label: "Comunicación" },
  { key: "puntaje_conocimientos", label: "Conocimientos del área" },
  { key: "puntaje_actitud", label: "Actitud y motivación" },
]

export default function Entrevistas({ perfil, onVolver }) {
  const [entrevistas, setEntrevistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [seleccionada, setSeleccionada] = useState(null)

  useEffect(() => {
    if (perfil?.id) cargar()
  }, [perfil?.id])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const data = await listarEntrevistasPorPerfil(perfil.id)
      setEntrevistas(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "Sin fecha"

  const colorPuntaje = (p) => {
    if (p == null) return "var(--muted-foreground)"
    if (p >= 85) return "var(--success)"
    if (p >= 70) return "var(--info)"
    if (p >= 50) return "var(--warning)"
    return "var(--destructive)"
  }

  const colorEstado = (e) => {
    if (e === "completada") return { color: "var(--success)", bg: "var(--success-bg)" }
    if (e === "programada") return { color: "var(--info)", bg: "var(--info-bg)" }
    return { color: "var(--destructive)", bg: "var(--destructive-bg)" }
  }

  const completadas = entrevistas.filter(e => e.estado === "completada")
  const conPuntaje = completadas.filter(e => e.puntaje != null)
  const promedio = conPuntaje.length > 0
    ? Math.round(conPuntaje.reduce((sum, e) => sum + e.puntaje, 0) / conPuntaje.length)
    : null
  const mejor = conPuntaje.length > 0 ? Math.max(...conPuntaje.map(e => e.puntaje)) : null

  return (
    <div style={s.container}>
      {/* Breadcrumbs */}
      <div style={s.breadcrumbs}>
        <span
          onClick={onVolver}
          style={s.breadLink}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          Inicio
        </span>
        <span style={s.breadSep}>/</span>
        <span style={{ color: "var(--foreground)" }}>Entrevistas</span>
      </div>

      {/* Hero */}
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Mis entrevistas</h1>
          <p style={s.subtitle}>Historial y puntajes de tus entrevistas anteriores</p>
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

      {/* Stats */}
      {entrevistas.length > 0 && (
        <div style={s.statsGrid} className="animate-slide-up">
          <StatCard value={entrevistas.length} label="Total entrevistas" color="var(--foreground)" />
          <StatCard value={completadas.length} label="Completadas" color="var(--success)" />
          <StatCard value={promedio != null ? promedio : "—"} label="Puntaje promedio" color={colorPuntaje(promedio)} />
          <StatCard value={mejor != null ? mejor : "—"} label="Mejor puntaje" color={colorPuntaje(mejor)} />
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /></div>
      ) : entrevistas.length === 0 ? (
        <div style={s.empty}>
          <h3 style={s.emptyTitle}>Aún no tienes entrevistas registradas</h3>
          <p style={s.muted}>
            Cuando una empresa programe una entrevista contigo, aparecerá aquí con sus detalles y puntaje.
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {entrevistas.map((ent) => {
            const est = colorEstado(ent.estado)
            const activa = seleccionada?.id === ent.id
            return (
              <div
                key={ent.id}
                onClick={() => setSeleccionada(activa ? null : ent)}
                style={{
                  ...s.row,
                  borderColor: activa ? "var(--primary)" : "var(--border)",
                }}
                className="animate-slide-up"
                onMouseEnter={(e) => {
                  if (!activa) e.currentTarget.style.boxShadow = "var(--shadow-md)"
                }}
                onMouseLeave={(e) => {
                  if (!activa) e.currentTarget.style.boxShadow = "var(--shadow-sm)"
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.rowHeader}>
                    <h3 style={s.vacanteTitle}>
                      {ent.vacante_titulo || "Entrevista"}
                    </h3>
                    {ent.vacante_empresa && (
                      <>
                        <span style={s.sep}>·</span>
                        <span style={s.empresa}>{ent.vacante_empresa}</span>
                      </>
                    )}
                  </div>
                  <div style={s.metaRow}>
                    <span style={s.meta}>{TIPO_LABEL[ent.tipo] || ent.tipo}</span>
                    <span style={{ ...s.estadoChip, color: est.color, background: est.bg }}>
                      {ESTADO_LABEL[ent.estado] || ent.estado}
                    </span>
                    <span style={s.fechaTxt}>{fmtFecha(ent.fecha_entrevista)}</span>
                  </div>
                </div>

                {ent.puntaje != null && (
                  <div style={s.scoreBox}>
                    <div style={{ ...s.scoreValue, color: colorPuntaje(ent.puntaje) }}>
                      {ent.puntaje}
                    </div>
                    <div style={s.scoreLabel}>
                      {NIVEL_LABEL[ent.nivel] || "—"}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Informe detallado */}
      {seleccionada && (
        <div style={s.detalleCard} className="animate-slide-up">
          <div style={s.detalleHeader}>
            <div>
              <h2 style={s.detalleTitle}>Informe de la entrevista</h2>
              <p style={s.muted}>
                {seleccionada.vacante_titulo}
                {seleccionada.vacante_empresa && ` · ${seleccionada.vacante_empresa}`}
              </p>
            </div>
            <button
              onClick={() => setSeleccionada(null)}
              style={s.closeBtn}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Puntaje destacado */}
          {seleccionada.puntaje != null && (
            <div style={s.scoreHero}>
              <div style={{ flex: 1 }}>
                <div style={s.scoreHeroLabel}>Tu puntaje obtenido</div>
                <div style={{ ...s.scoreHeroValue, color: colorPuntaje(seleccionada.puntaje) }}>
                  {seleccionada.puntaje}<span style={s.scoreHeroMax}>/100</span>
                </div>
                <div style={{ ...s.scoreHeroLevel, color: colorPuntaje(seleccionada.puntaje) }}>
                  {NIVEL_LABEL[seleccionada.nivel] || "—"}
                </div>
              </div>

              {/* Círculo de progreso */}
              <div style={s.circleWrap}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="rgba(0,0,0,0.06)" strokeWidth="8" fill="none" />
                  <circle
                    cx="60" cy="60" r="50"
                    stroke={colorPuntaje(seleccionada.puntaje)}
                    strokeWidth="8" fill="none"
                    strokeDasharray={`${(seleccionada.puntaje / 100) * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
                  />
                </svg>
                <div style={s.circleLabel}>{seleccionada.puntaje}%</div>
              </div>
            </div>
          )}

          {/* Desglose por categorías */}
          {(seleccionada.puntaje_tecnico != null ||
            seleccionada.puntaje_comunicacion != null ||
            seleccionada.puntaje_conocimientos != null ||
            seleccionada.puntaje_actitud != null) && (
            <div style={s.detalleSection}>
              <h3 style={s.detalleSubtitle}>Desglose por categoría</h3>
              {CATEGORIAS.map((cat) => {
                const valor = seleccionada[cat.key]
                if (valor == null) return null
                return (
                  <div key={cat.key} style={{ marginBottom: 14 }}>
                    <div style={s.barHeader}>
                      <span style={s.barLabel}>{cat.label}</span>
                      <span style={{ ...s.barValue, color: colorPuntaje(valor) }}>
                        {valor}/100
                      </span>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{
                        ...s.barFill,
                        width: `${valor}%`,
                        background: colorPuntaje(valor),
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Información general */}
          <div style={s.detalleSection}>
            <h3 style={s.detalleSubtitle}>Información general</h3>
            <div style={s.detailGrid}>
              <Detail label="Tipo" value={TIPO_LABEL[seleccionada.tipo] || seleccionada.tipo} />
              <Detail label="Estado" value={ESTADO_LABEL[seleccionada.estado] || seleccionada.estado} />
              <Detail label="Fecha" value={fmtFecha(seleccionada.fecha_entrevista)} />
              <Detail label="Duración" value={seleccionada.duracion_minutos ? `${seleccionada.duracion_minutos} min` : "—"} />
              <Detail label="Entrevistador" value={seleccionada.entrevistador || "—"} />
            </div>
          </div>

          {seleccionada.fortalezas && (
            <FeedbackBox color="var(--success)" title="Fortalezas" text={seleccionada.fortalezas} />
          )}

          {seleccionada.debilidades && (
            <FeedbackBox color="var(--warning)" title="Áreas de mejora" text={seleccionada.debilidades} />
          )}

          {seleccionada.recomendaciones && (
            <FeedbackBox color="var(--primary)" title="Recomendaciones" text={seleccionada.recomendaciones} />
          )}

          {seleccionada.estado === "programada" && seleccionada.puntaje == null && (
            <div style={s.pendingBox}>
              <strong>Entrevista programada</strong> · Tu puntaje aparecerá aquí una vez la entrevista sea completada y evaluada.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, color }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statValue, color }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={s.infoItem}>
      <div style={s.itemLabel}>{label}</div>
      <div style={s.itemValue}>{value}</div>
    </div>
  )
}

function FeedbackBox({ color, title, text }) {
  return (
    <div style={{
      ...s.feedbackBox,
      borderLeft: `3px solid ${color}`,
    }}>
      <h4 style={{ ...s.feedbackTitle, color }}>{title}</h4>
      <p style={s.feedbackText}>{text}</p>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginBottom: 28,
  },
  breadLink: {
    cursor: "pointer",
    color: "var(--primary)",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  breadSep: { color: "var(--muted-foreground)" },
  heroRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 36,
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statValue: {
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
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
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 24px",
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    gap: 20,
  },
  rowHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  vacanteTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--foreground)",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sep: { color: "var(--muted-foreground)", fontSize: 14 },
  empresa: { fontSize: 15, color: "var(--muted-foreground)" },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    padding: "3px 10px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
  },
  estadoChip: {
    fontSize: 11,
    padding: "3px 10px",
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
  },
  fechaTxt: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginLeft: 4,
  },
  scoreBox: {
    textAlign: "center",
    flexShrink: 0,
    minWidth: 70,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginTop: 4,
  },
  // Detalle expandido
  detalleCard: {
    marginTop: 24,
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 32,
    boxShadow: "var(--shadow-md)",
  },
  detalleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 16,
  },
  detalleTitle: {
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 6,
    color: "var(--foreground)",
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.04)",
    border: "none",
    fontSize: 18,
    color: "var(--muted-foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  scoreHero: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: 32,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-lg)",
    marginBottom: 28,
    flexWrap: "wrap",
  },
  scoreHeroLabel: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    fontWeight: 500,
  },
  scoreHeroValue: {
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  scoreHeroMax: {
    fontSize: 24,
    color: "var(--muted-foreground)",
    fontWeight: 400,
  },
  scoreHeroLevel: {
    fontSize: 15,
    fontWeight: 500,
    marginTop: 10,
  },
  circleWrap: {
    position: "relative",
    width: 120,
    height: 120,
    flexShrink: 0,
  },
  circleLabel: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 600,
    color: "var(--foreground)",
    letterSpacing: "-0.01em",
  },
  detalleSection: { marginBottom: 28 },
  detalleSubtitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 18,
    color: "var(--foreground)",
  },
  barHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 14,
    color: "var(--foreground)",
    fontWeight: 500,
  },
  barValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  barTrack: {
    width: "100%",
    height: 8,
    background: "rgba(0,0,0,0.06)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  infoItem: {
    padding: 14,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  itemLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 4,
    fontWeight: 500,
  },
  itemValue: {
    fontSize: 14,
    color: "var(--foreground)",
  },
  feedbackBox: {
    padding: "14px 18px",
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: "0.01em",
  },
  feedbackText: {
    fontSize: 14,
    color: "var(--foreground)",
    lineHeight: 1.6,
  },
  pendingBox: {
    marginTop: 16,
    padding: 16,
    background: "var(--info-bg)",
    color: "var(--info)",
    fontSize: 14,
    border: "1px solid rgba(90, 200, 250, 0.25)",
    borderRadius: "var(--radius-md)",
  },
}