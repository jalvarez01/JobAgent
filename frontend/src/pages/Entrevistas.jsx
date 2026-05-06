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
    if (p == null) return "rgba(0,0,0,0.3)"
    if (p >= 85) return "#059669"
    if (p >= 70) return "#0891b2"
    if (p >= 50) return "#d97706"
    return "#b91c1c"
  }

  const colorEstado = (e) => {
    if (e === "completada") return { color: "#059669", bg: "#d1fae5" }
    if (e === "programada") return { color: "#1e40af", bg: "#dbeafe" }
    return { color: "#b91c1c", bg: "#fee2e2" }
  }

  const completadas = entrevistas.filter(e => e.estado === "completada")
  const conPuntaje = completadas.filter(e => e.puntaje != null)
  const promedio = conPuntaje.length > 0
    ? Math.round(conPuntaje.reduce((sum, e) => sum + e.puntaje, 0) / conPuntaje.length)
    : null
  const mejor = conPuntaje.length > 0 ? Math.max(...conPuntaje.map(e => e.puntaje)) : null

  return (
    <div style={s.container}>
      <div style={s.breadcrumbs}>
        <span onClick={onVolver} style={s.breadLink}>Inicio</span>
        <span style={s.breadSep}>/</span>
        <span style={{ color: "#1a1a1a" }}>Entrevistas</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={s.title}>Mis entrevistas</h1>
          <p style={s.subtitle}>Historial y puntajes de tus entrevistas anteriores</p>
        </div>
        <button onClick={onVolver} style={s.btnSec}>← Volver</button>
      </div>

      {entrevistas.length > 0 && (
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statValue}>{entrevistas.length}</div>
            <div style={s.statLabel}>Total entrevistas</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{completadas.length}</div>
            <div style={s.statLabel}>Completadas</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statValue, color: colorPuntaje(promedio) }}>
              {promedio != null ? `${promedio}` : "—"}
            </div>
            <div style={s.statLabel}>Puntaje promedio</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statValue, color: colorPuntaje(mejor) }}>
              {mejor != null ? `${mejor}` : "—"}
            </div>
            <div style={s.statLabel}>Mejor puntaje</div>
          </div>
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: 60, ...s.muted }}>Cargando entrevistas...</p>
      ) : entrevistas.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>○</div>
          <p style={{ marginBottom: 8, fontSize: 16, color: "#1a1a1a" }}>Aún no tienes entrevistas registradas</p>
          <p style={s.muted}>
            Cuando una empresa programe una entrevista contigo, aparecerá aquí con sus detalles y puntaje.
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {entrevistas.map((ent) => {
            const est = colorEstado(ent.estado)
            return (
              <div
                key={ent.id}
                onClick={() => setSeleccionada(seleccionada?.id === ent.id ? null : ent)}
                style={{ ...s.row, borderLeft: `3px solid ${ent.puntaje != null ? colorPuntaje(ent.puntaje) : "rgba(0,0,0,0.1)"}` }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, margin: 0, color: "#1a1a1a", fontWeight: 500 }}>
                      {ent.vacante_titulo || "Entrevista"}
                    </h3>
                    {ent.vacante_empresa && <span style={s.muted}>· {ent.vacante_empresa}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={s.meta}>{TIPO_LABEL[ent.tipo] || ent.tipo}</span>
                    <span style={{ ...s.estadoChip, color: est.color, background: est.bg }}>
                      {ESTADO_LABEL[ent.estado] || ent.estado}
                    </span>
                    <span style={{ ...s.muted, fontSize: 13 }}>{fmtFecha(ent.fecha_entrevista)}</span>
                  </div>
                </div>

                {ent.puntaje != null && (
                  <div style={{ textAlign: "center", marginLeft: 20 }}>
                    <div style={{ fontSize: 32, fontWeight: 600, color: colorPuntaje(ent.puntaje) }}>
                      {ent.puntaje}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", textTransform: "capitalize" }}>
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
        <div style={s.detalleCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, color: "#1a1a1a" }}>Informe de la entrevista</h2>
              <p style={s.muted}>{seleccionada.vacante_titulo} · {seleccionada.vacante_empresa}</p>
            </div>
            <span onClick={() => setSeleccionada(null)} style={{ cursor: "pointer", fontSize: 20, color: "rgba(0,0,0,0.4)" }}>✕</span>
          </div>

          {/* Puntaje destacado */}
          {seleccionada.puntaje != null && (
            <div style={s.scoreHero}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", marginBottom: 4 }}>Tu puntaje obtenido</div>
                <div style={{ fontSize: 48, fontWeight: 600, color: colorPuntaje(seleccionada.puntaje), lineHeight: 1 }}>
                  {seleccionada.puntaje}<span style={{ fontSize: 24, color: "rgba(0,0,0,0.3)" }}>/100</span>
                </div>
                <div style={{ fontSize: 14, color: colorPuntaje(seleccionada.puntaje), fontWeight: 500, marginTop: 6 }}>
                  Nivel: {NIVEL_LABEL[seleccionada.nivel] || "—"}
                </div>
              </div>

              {/* Círculo de progreso */}
              <div style={s.circleWrap}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#f0f0f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke={colorPuntaje(seleccionada.puntaje)}
                    strokeWidth="8" fill="none"
                    strokeDasharray={`${(seleccionada.puntaje / 100) * 264} 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
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
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Desglose por categoría</h3>
              {CATEGORIAS.map((cat) => {
                const valor = seleccionada[cat.key]
                if (valor == null) return null
                return (
                  <div key={cat.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "#1a1a1a" }}>{cat.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: colorPuntaje(valor) }}>{valor}/100</span>
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

          {/* Datos generales */}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Información general</h3>
            <div style={s.detailGrid}>
              <Detail label="Tipo de entrevista" value={TIPO_LABEL[seleccionada.tipo] || seleccionada.tipo} />
              <Detail label="Estado" value={ESTADO_LABEL[seleccionada.estado] || seleccionada.estado} />
              <Detail label="Fecha" value={fmtFecha(seleccionada.fecha_entrevista)} />
              <Detail label="Duración" value={seleccionada.duracion_minutos ? `${seleccionada.duracion_minutos} min` : "—"} />
              <Detail label="Entrevistador" value={seleccionada.entrevistador || "—"} />
            </div>
          </div>

          {seleccionada.fortalezas && (
            <div style={{ ...s.feedbackBox, borderLeftColor: "#059669" }}>
              <h4 style={{ ...s.feedbackTitle, color: "#059669" }}>Fortalezas</h4>
              <p style={s.feedbackText}>{seleccionada.fortalezas}</p>
            </div>
          )}

          {seleccionada.debilidades && (
            <div style={{ ...s.feedbackBox, borderLeftColor: "#d97706" }}>
              <h4 style={{ ...s.feedbackTitle, color: "#d97706" }}>Áreas de mejora</h4>
              <p style={s.feedbackText}>{seleccionada.debilidades}</p>
            </div>
          )}

          {seleccionada.recomendaciones && (
            <div style={{ ...s.feedbackBox, borderLeftColor: "#1e40af" }}>
              <h4 style={{ ...s.feedbackTitle, color: "#1e40af" }}>Recomendaciones</h4>
              <p style={s.feedbackText}>{seleccionada.recomendaciones}</p>
            </div>
          )}

          {seleccionada.estado === "programada" && seleccionada.puntaje == null && (
            <div style={s.pendingBox}>
              <strong>Entrevista programada</strong> — Tu puntaje aparecerá aquí una vez la entrevista sea completada y evaluada.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={{ padding: 14, background: "#fafafa" }}>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1a1a1a" }}>{value}</div>
    </div>
  )
}

const s = {
  container: { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
  breadcrumbs: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 24 },
  breadLink: { cursor: "pointer", color: "rgba(0,0,0,0.6)" },
  breadSep: { color: "rgba(0,0,0,0.3)" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em", color: "#1a1a1a" },
  subtitle: { fontSize: 17, color: "rgba(0,0,0,0.55)" },
  muted: { color: "rgba(0,0,0,0.5)", fontSize: 14 },
  error: { color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)", background: "#fef2f2", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  btnSec: { padding: "10px 20px", background: "#fff", color: "#1a1a1a", border: "1px solid rgba(0,0,0,0.15)", fontSize: 13, cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 },
  statCard: { border: "1px solid rgba(0,0,0,0.1)", padding: 20, textAlign: "center", background: "#fff" },
  statValue: { fontSize: 32, fontWeight: 500, marginBottom: 4, color: "#1a1a1a" },
  statLabel: { fontSize: 12, color: "rgba(0,0,0,0.55)" },
  empty: { textAlign: "center", padding: 60 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
    cursor: "pointer", transition: "border-color 0.15s",
  },
  meta: { fontSize: 12, color: "rgba(0,0,0,0.6)", padding: "2px 8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fafafa" },
  estadoChip: { fontSize: 11, padding: "2px 8px", fontWeight: 500 },
  detalleCard: { marginTop: 24, border: "1px solid rgba(0,0,0,0.1)", padding: 28, background: "#fff" },
  scoreHero: {
    display: "flex", alignItems: "center", gap: 24,
    padding: 28, background: "#fafafa", border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 28,
  },
  circleWrap: { position: "relative", width: 100, height: 100 },
  circleLabel: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 600, color: "#1a1a1a",
  },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, color: "#1a1a1a", marginBottom: 16, fontWeight: 500 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  barTrack: { width: "100%", height: 8, background: "#f0f0f0", overflow: "hidden" },
  barFill: { height: "100%", transition: "width 0.5s ease" },
  feedbackBox: { padding: "14px 16px", background: "#fafafa", marginBottom: 12, borderLeft: "3px solid" },
  feedbackTitle: { fontSize: 13, fontWeight: 500, marginBottom: 8 },
  feedbackText: { fontSize: 14, color: "rgba(0,0,0,0.75)", lineHeight: 1.6 },
  pendingBox: {
    marginTop: 20, padding: 16, background: "#dbeafe", color: "#1e40af",
    fontSize: 14, border: "1px solid rgba(30,64,175,0.2)",
  },
}