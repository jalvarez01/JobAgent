import { useState } from "react"
import { ejecutarPipeline } from "../api/postulaciones"

const AGENTES = [
  { key: "perfil_agent", label: "Perfil", num: "01" },
  { key: "vacantes_agent", label: "Vacantes", num: "02" },
  { key: "recomendacion_agent", label: "Recomendación", num: "03" },
  { key: "postulacion_agent", label: "Postulación", num: "04" },
  { key: "seguimiento_agent", label: "Seguimiento", num: "05" },
]

export default function PipelineDashboard({ perfil, onVerTablero, onVolver }) {
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEjecutar = async () => {
    setLoading(true); setError(""); setResultado(null)
    try {
      const res = await ejecutarPipeline(perfil.id, perfil.cv_texto || "")
      setResultado(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const logsDeAgente = (key) => resultado?.log?.filter((l) => l.includes(`[${key}]`)) || []

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={s.title}>Pipeline</h1>
          <p style={s.subtitle}>Ejecuta el flujo completo de agentes de IA</p>
        </div>
        <button onClick={onVolver} style={s.btnSec}>&#8592; Volver</button>
      </div>

      {/* Ejecutar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <button onClick={handleEjecutar} disabled={loading} style={s.btnPrimary}>
          {loading ? "Ejecutando..." : "Ejecutar pipeline"}
        </button>
        <span style={s.subtitle}>{perfil?.nombre_completo} · {perfil?.skills?.length || 0} skills</span>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {resultado && (
        <>
          {/* Agentes */}
          <div style={s.agentRow}>
            {AGENTES.map((ag, i) => {
              const logs = logsDeAgente(ag.key)
              const hasErr = resultado.errores?.some((e) => e.includes(`[${ag.key}]`))
              return (
                <div key={ag.key} style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ ...s.agentCard, borderColor: hasErr ? "rgba(248,113,113,0.5)" : logs.length > 0 ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{ag.num}</div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}>{ag.label}</div>
                    {logs.map((l, j) => (
                      <div key={j} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, marginBottom: 2 }}>
                        {l.replace(`[${ag.key}] `, "")}
                      </div>
                    ))}
                  </div>
                  {i < AGENTES.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)", padding: "20px 8px 0", fontSize: 16 }}>&#8594;</span>}
                </div>
              )
            })}
          </div>

          {/* Métricas */}
          <div style={s.metricsGrid}>
            <MetricCard value={resultado.recomendaciones?.length || 0} label="Vacantes recomendadas" />
            <MetricCard value={resultado.postulaciones_count || 0} label="Postulaciones automáticas" />
            <MetricCard value={resultado.perfil_completo ? "Sí" : "No"} label="Perfil completo" accent={resultado.perfil_completo} />
          </div>

          {/* Notificaciones */}
          {resultado.notificaciones?.length > 0 && (
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Notificaciones</h3>
              {resultado.notificaciones.map((n, i) => (
                <div key={i} style={s.notif}>{n}</div>
              ))}
            </div>
          )}

          {/* Próximos pasos */}
          {resultado.proximos_pasos?.length > 0 && (
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Próximos pasos</h3>
              {resultado.proximos_pasos.map((p, i) => (
                <div key={i} style={s.paso}>
                  <span style={s.pasoNum}>{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Errores */}
          {resultado.errores?.length > 0 && (
            <div style={s.section}>
              <h3 style={{ ...s.sectionTitle, color: "rgba(248,113,113,0.9)" }}>Errores</h3>
              {resultado.errores.map((e, i) => <p key={i} style={{ fontSize: 13, color: "rgba(248,113,113,0.7)", marginBottom: 4 }}>{e}</p>)}
            </div>
          )}

          {resultado.postulaciones_count > 0 && (
            <button onClick={onVerTablero} style={{ ...s.btnPrimary, marginTop: 24 }}>Ver tablero de seguimiento &#8594;</button>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({ value, label, accent }) {
  return (
    <div style={s.metricCard}>
      <div style={{ fontSize: 36, color: accent === false ? "rgba(251,191,36,0.8)" : "#fff" }}>{value}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </div>
  )
}

const s = {
  container: { maxWidth: 960, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)" },
  error: { color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  btnPrimary: { padding: "14px 28px", background: "#fff", color: "#000", border: "none", fontSize: 14, cursor: "pointer" },
  btnSec: { padding: "10px 20px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" },
  agentRow: { display: "flex", overflowX: "auto", marginBottom: 32, paddingBottom: 8 },
  agentCard: { border: "1px solid", padding: 14, minWidth: 140, maxWidth: 160 },
  metricsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 },
  metricCard: { border: "1px solid rgba(255,255,255,0.1)", padding: 24, textAlign: "center" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  notif: { fontSize: 14, color: "rgba(255,255,255,0.7)", padding: "10px 14px", borderLeft: "2px solid rgba(255,255,255,0.2)", marginBottom: 6 },
  paso: { fontSize: 14, padding: "8px 0", display: "flex", alignItems: "flex-start", gap: 10 },
  pasoNum: { width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, flexShrink: 0 },
}