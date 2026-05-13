import { useState } from "react"
import { ejecutarPipeline } from "../api/postulaciones"

const AGENTES = [
  { key: "perfil_agent", label: "Análisis de perfil", desc: "Procesa tu CV y extrae datos estructurados" },
  { key: "vacantes_agent", label: "Carga de vacantes", desc: "Recolecta todas las vacantes activas" },
  { key: "recomendacion_agent", label: "Recomendación", desc: "Compara skills y calcula matches" },
  { key: "postulacion_agent", label: "Postulación automática", desc: "Aplica a vacantes con match alto" },
  { key: "seguimiento_agent", label: "Seguimiento", desc: "Genera próximos pasos y notificaciones" },
]

export default function PipelineDashboard({ perfil, onVerTablero, onVolver }) {
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEjecutar = async () => {
    if (!perfil?.id) return
    setLoading(true); setError(""); setResultado(null)
    try {
      const data = await ejecutarPipeline(perfil.id)
      setResultado(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const log = resultado?.log || []
  const agentesEjecutados = log.map((entry) => {
    const match = AGENTES.find((a) => entry.toLowerCase().includes(a.key.replace("_agent", "")))
    return match?.key
  }).filter(Boolean)

  return (
    <div style={s.container}>
      {/* Hero */}
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Pipeline de agentes</h1>
          <p style={s.subtitle}>
            Cinco agentes de IA trabajan en secuencia para analizar tu perfil y encontrar las mejores oportunidades.
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

      {/* CTA principal */}
      {!resultado && !loading && (
        <div style={s.ctaCard} className="animate-slide-up">
          <h2 style={s.ctaTitle}>Ejecuta el pipeline completo</h2>
          <p style={s.ctaDesc}>
            Los cinco agentes analizarán tu perfil, calcularán recomendaciones y postularán automáticamente a vacantes con match alto.
          </p>
          <button
            onClick={handleEjecutar}
            disabled={loading}
            style={s.btnPrimaryLarge}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            Ejecutar pipeline
          </button>
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      {/* Loading state — agentes ejecutándose */}
      {loading && (
        <div style={s.card} className="animate-slide-up">
          <h3 style={s.sectionTitle}>Ejecutando agentes...</h3>
          <div style={s.agentesList}>
            {AGENTES.map((agente, i) => (
              <AgentRow
                key={agente.key}
                agente={agente}
                index={i + 1}
                status="running"
              />
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultado && (
        <div className="animate-slide-up">
          {/* Métricas top */}
          <div style={s.statsGrid}>
            <StatCard
              value={resultado.recomendaciones?.length || 0}
              label="Recomendaciones"
              color="var(--primary)"
            />
            <StatCard
              value={resultado.postulaciones_realizadas?.length || 0}
              label="Postulaciones automáticas"
              color="var(--success)"
            />
            <StatCard
              value={resultado.notificaciones?.length || 0}
              label="Notificaciones generadas"
              color="var(--warning)"
            />
            <StatCard
              value={resultado.errores?.length || 0}
              label="Errores"
              color={resultado.errores?.length ? "var(--destructive)" : "var(--muted-foreground)"}
            />
          </div>

          {/* Agentes ejecutados */}
          <div style={s.card}>
            <h3 style={s.sectionTitle}>Agentes ejecutados</h3>
            <div style={s.agentesList}>
              {AGENTES.map((agente, i) => {
                const ejecutado = agentesEjecutados.includes(agente.key)
                return (
                  <AgentRow
                    key={agente.key}
                    agente={agente}
                    index={i + 1}
                    status={ejecutado ? "done" : "skipped"}
                  />
                )
              })}
            </div>
          </div>

          {/* Próximos pasos */}
          {resultado.proximos_pasos?.length > 0 && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>Próximos pasos</h3>
              <div style={s.listGrouped}>
                {resultado.proximos_pasos.map((paso, i) => (
                  <div key={i} style={s.listItem}>
                    <span style={s.checkmark}>✓</span>
                    <span style={{ fontSize: 15 }}>{paso}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {resultado.notificaciones?.length > 0 && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>Notificaciones</h3>
              <div style={s.listGrouped}>
                {resultado.notificaciones.map((notif, i) => (
                  <div key={i} style={s.listItem}>
                    <span style={s.bullet}>·</span>
                    <span style={{ fontSize: 15 }}>{notif}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>Registro de ejecución</h3>
              <div style={s.logBox}>
                {log.map((entry, i) => (
                  <div key={i} style={s.logLine}>
                    <span style={s.logIndex}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={s.logText}>{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errores */}
          {resultado.errores?.length > 0 && (
            <div style={s.errorCard}>
              <h3 style={s.errorTitle}>Errores detectados</h3>
              {resultado.errores.map((err, i) => (
                <div key={i} style={s.errorItem}>{err}</div>
              ))}
            </div>
          )}

          {/* Acciones finales */}
          <div style={s.actions}>
            <button
              onClick={() => setResultado(null)}
              style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Ejecutar de nuevo
            </button>
            {onVerTablero && (
              <button
                onClick={onVerTablero}
                style={s.btnPrimary}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
              >
                Ver tablero de postulaciones
              </button>
            )}
          </div>
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

function AgentRow({ agente, index, status }) {
  const colors = {
    running: { bg: "var(--info-bg)", color: "var(--info)", icon: "•" },
    done: { bg: "var(--success-bg)", color: "var(--success)", icon: "✓" },
    skipped: { bg: "rgba(0,0,0,0.04)", color: "var(--muted-foreground)", icon: index },
  }
  const c = colors[status]

  return (
    <div style={s.agentRow}>
      <div style={{ ...s.agentBadge, background: c.bg, color: c.color }}>
        {status === "running" ? (
          <div style={{ ...s.miniSpinner, borderTopColor: c.color }} />
        ) : (
          c.icon
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={s.agentName}>{agente.label}</div>
        <div style={s.agentDesc}>{agente.desc}</div>
      </div>
      <div style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>
        {status === "running" ? "Procesando..." : status === "done" ? "Completado" : "—"}
      </div>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
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
    maxWidth: 580,
  },
  card: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  ctaCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 56,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 12,
    color: "var(--foreground)",
  },
  ctaDesc: {
    fontSize: 17,
    color: "var(--muted-foreground)",
    maxWidth: 540,
    margin: "0 auto 32px",
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 20,
    color: "var(--foreground)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
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
  agentesList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 4px",
    borderBottom: "1px solid var(--border)",
  },
  agentBadge: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  agentName: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: 2,
  },
  agentDesc: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  miniSpinner: {
    width: 14,
    height: 14,
    border: "2px solid transparent",
    borderTopColor: "var(--info)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  listGrouped: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "10px 4px",
    borderBottom: "1px solid var(--border)",
  },
  checkmark: {
    color: "var(--success)",
    fontSize: 14,
    marginTop: 2,
    flexShrink: 0,
  },
  bullet: {
    color: "var(--muted-foreground)",
    fontSize: 18,
    marginTop: -4,
    flexShrink: 0,
  },
  logBox: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: 12,
    background: "rgba(0,0,0,0.03)",
    borderRadius: "var(--radius-md)",
    padding: 16,
    maxHeight: 280,
    overflowY: "auto",
  },
  logLine: {
    display: "flex",
    gap: 12,
    padding: "4px 0",
  },
  logIndex: {
    color: "var(--muted-foreground)",
    flexShrink: 0,
  },
  logText: {
    color: "var(--foreground)",
  },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  errorCard: {
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--destructive)",
    marginBottom: 12,
  },
  errorItem: {
    fontSize: 14,
    color: "var(--destructive)",
    padding: "6px 0",
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 24,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "13px 28px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  btnPrimaryLarge: {
    padding: "15px 36px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 17,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  btnSecondary: {
    padding: "13px 24px",
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