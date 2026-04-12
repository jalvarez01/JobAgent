import { useState } from "react"
import { ejecutarPipeline } from "../api/postulaciones"

const AGENTES = [
  { key: "perfil_agent", label: "Agente de Perfil", icon: "1" },
  { key: "vacantes_agent", label: "Agente de Vacantes", icon: "2" },
  { key: "recomendacion_agent", label: "Agente de Recomendación", icon: "3" },
  { key: "postulacion_agent", label: "Agente de Postulación", icon: "4" },
  { key: "seguimiento_agent", label: "Agente de Seguimiento", icon: "5" },
]

export default function PipelineDashboard({ perfil, onVerTablero, onVolver }) {
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEjecutar = async () => {
    setLoading(true)
    setError("")
    setResultado(null)
    try {
      const res = await ejecutarPipeline(perfil.id, perfil.cv_texto || "")
      setResultado(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logsDeAgente = (key) => {
    if (!resultado?.log) return []
    return resultado.log.filter((l) => l.includes(`[${key}]`))
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Pipeline de agentes</h2>
          <p style={styles.subtitle}>
            Ejecuta el flujo completo: analizar perfil → cargar vacantes → recomendar → postular → seguimiento
          </p>
        </div>
        <button onClick={onVolver} style={styles.btnSecundario}>← Volver</button>
      </div>

      {/* Botón de ejecución */}
      <div style={styles.ejecutarSection}>
        <button
          onClick={handleEjecutar}
          disabled={loading}
          style={styles.btnEjecutar}
        >
          {loading ? "Ejecutando pipeline..." : "Ejecutar pipeline completo"}
        </button>
        {perfil && (
          <span style={styles.perfilInfo}>
            Perfil: {perfil.nombre_completo} · {perfil.skills?.length || 0} skills
          </span>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Resultado */}
      {resultado && (
        <div>
          {/* Visualización del flujo de agentes */}
          <div style={styles.pipeline}>
            {AGENTES.map((agente, i) => {
              const logs = logsDeAgente(agente.key)
              const tieneError = resultado.errores?.some((e) => e.includes(`[${agente.key}]`))
              return (
                <div key={agente.key} style={styles.agenteContainer}>
                  <div style={{
                    ...styles.agenteCard,
                    borderColor: tieneError ? "#ef4444" : logs.length > 0 ? "#10b981" : "#d1d5db",
                  }}>
                    <div style={{
                      ...styles.agenteIcon,
                      background: tieneError ? "#fef2f2" : "#ecfdf5",
                      color: tieneError ? "#dc2626" : "#059669",
                    }}>
                      {agente.icon}
                    </div>
                    <p style={styles.agenteLabel}>{agente.label}</p>
                    <div style={styles.agenteLogs}>
                      {logs.map((l, j) => (
                        <p key={j} style={styles.logLine}>
                          {l.replace(`[${agente.key}] `, "")}
                        </p>
                      ))}
                    </div>
                  </div>
                  {i < AGENTES.length - 1 && <div style={styles.arrow}>→</div>}
                </div>
              )
            })}
          </div>

          {/* Resumen */}
          <div style={styles.resumen}>
            <div style={styles.resumenCard}>
              <span style={styles.resumenNum}>{resultado.recomendaciones?.length || 0}</span>
              <span style={styles.resumenLabel}>Vacantes recomendadas</span>
            </div>
            <div style={styles.resumenCard}>
              <span style={styles.resumenNum}>{resultado.postulaciones_count || 0}</span>
              <span style={styles.resumenLabel}>Postulaciones automáticas</span>
            </div>
            <div style={styles.resumenCard}>
              <span style={{
                ...styles.resumenNum,
                color: resultado.perfil_completo ? "#059669" : "#d97706",
              }}>
                {resultado.perfil_completo ? "Sí" : "No"}
              </span>
              <span style={styles.resumenLabel}>Perfil completo</span>
            </div>
          </div>

          {/* Notificaciones y próximos pasos */}
          {resultado.notificaciones?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Notificaciones</h3>
              {resultado.notificaciones.map((n, i) => (
                <div key={i} style={styles.notif}>{n}</div>
              ))}
            </div>
          )}

          {resultado.proximos_pasos?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Próximos pasos</h3>
              {resultado.proximos_pasos.map((p, i) => (
                <div key={i} style={styles.paso}>
                  <span style={styles.pasoNum}>{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Errores */}
          {resultado.errores?.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: "#dc2626" }}>Errores</h3>
              {resultado.errores.map((e, i) => (
                <p key={i} style={styles.errorLine}>{e}</p>
              ))}
            </div>
          )}

          {/* Acción de ir al tablero */}
          {resultado.postulaciones_count > 0 && (
            <div style={{ marginTop: 20 }}>
              <button onClick={onVerTablero} style={styles.btnPrimario}>
                Ver tablero de seguimiento →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 860, margin: "0 auto", padding: "24px 16px", textAlign: "left" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  subtitle: { fontSize: 14, color: "#6b7280", margin: "4px 0 0" },
  ejecutarSection: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  btnEjecutar: {
    padding: "12px 28px", background: "#7c3aed", color: "#fff", border: "none",
    borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600,
  },
  perfilInfo: { fontSize: 13, color: "#6b7280" },
  error: { color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 6, marginBottom: 12 },
  pipeline: { display: "flex", gap: 0, overflowX: "auto", paddingBottom: 12, marginBottom: 20, alignItems: "flex-start" },
  agenteContainer: { display: "flex", alignItems: "flex-start", gap: 0 },
  agenteCard: {
    border: "2px solid", borderRadius: 10, padding: 12, minWidth: 140, maxWidth: 160,
    background: "#fff", textAlign: "center",
  },
  agenteIcon: {
    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 6px", fontWeight: 700, fontSize: 14,
  },
  agenteLabel: { fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 6px" },
  agenteLogs: { textAlign: "left" },
  logLine: { fontSize: 11, color: "#6b7280", margin: "2px 0", lineHeight: 1.3 },
  arrow: { fontSize: 18, color: "#d1d5db", padding: "20px 6px 0", flexShrink: 0 },
  resumen: { display: "flex", gap: 12, marginBottom: 20 },
  resumenCard: {
    flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 16,
    textAlign: "center", background: "#fff",
  },
  resumenNum: { fontSize: 28, fontWeight: 700, color: "#111827", display: "block" },
  resumenLabel: { fontSize: 13, color: "#6b7280" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#374151", margin: "0 0 8px" },
  notif: {
    fontSize: 14, color: "#1e40af", background: "#eff6ff", padding: "8px 12px",
    borderRadius: 6, marginBottom: 6, borderLeft: "3px solid #3b82f6",
  },
  paso: {
    fontSize: 14, color: "#374151", padding: "6px 0", display: "flex", alignItems: "flex-start", gap: 8,
  },
  pasoNum: {
    width: 22, height: 22, borderRadius: "50%", background: "#ede9fe", color: "#7c3aed",
    fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  errorLine: { fontSize: 13, color: "#dc2626", margin: "4px 0" },
  btnPrimario: {
    padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none",
    borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500,
  },
  btnSecundario: {
    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
    borderRadius: 6, cursor: "pointer", fontSize: 13, flexShrink: 0,
  },
}
