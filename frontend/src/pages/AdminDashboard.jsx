import { useState, useEffect } from "react"
import { obtenerDashboardResumen } from "../api/dashboard"

const ESTADOS_LABEL = {
  postulado: "Postulado",
  en_revision: "En revisión",
  entrevista: "Entrevista",
  oferta: "Oferta",
  descartado: "Descartado",
  retirado: "Retirado",
}

const ESTADOS_COLOR = {
  postulado: "var(--info)",
  en_revision: "var(--warning)",
  entrevista: "#7c3aed",
  oferta: "var(--success)",
  descartado: "var(--destructive)",
  retirado: "var(--muted-foreground)",
}

const NIVELES_LABEL = {
  bachiller: "Bachiller",
  tecnico: "Técnico",
  tecnologo: "Tecnólogo",
  profesional: "Profesional",
  especialista: "Especialista",
  maestria: "Maestría",
  doctorado: "Doctorado",
  "No especificado": "No especificado",
}

export default function AdminDashboard({ onVolver }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const res = await obtenerDashboardResumen()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.loading}><div style={s.spinner} /></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={s.container}>
        <div style={s.error}>{error || "No se pudo cargar el dashboard"}</div>
      </div>
    )
  }

  const m = data.metricas
  const skillsTop = data.top_skills_demandados
  const skillsCandidatos = data.top_skills_candidatos
  const vacantesTop = data.vacantes_populares
  const niveles = data.distribucion_educativa
  const tasaMatch = data.tasa_match

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>Métricas y análisis del sistema en tiempo real</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={cargar}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Actualizar
          </button>
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
      </div>

      {/* KPIs principales */}
      <div style={s.kpiGrid} className="animate-slide-up">
        <KpiCard
          label="Candidatos registrados"
          value={m.total_candidatos}
          color="var(--primary)"
        />
        <KpiCard
          label="Vacantes activas"
          value={m.vacantes_activas}
          subtitle={`${m.total_vacantes} totales`}
          color="var(--success)"
        />
        <KpiCard
          label="Postulaciones totales"
          value={m.total_postulaciones}
          color="#7c3aed"
        />
        <KpiCard
          label="Match promedio"
          value={`${tasaMatch.promedio}%`}
          subtitle={`${tasaMatch.total_postulaciones_con_score} con score`}
          color="var(--warning)"
        />
      </div>

      {/* Postulaciones por estado */}
      <Section title="Postulaciones por estado">
        {Object.keys(m.postulaciones_por_estado).length === 0 ? (
          <EmptyText>Sin postulaciones registradas todavía</EmptyText>
        ) : (
          <div style={s.estadosGrid}>
            {Object.entries(m.postulaciones_por_estado).map(([estado, count]) => (
              <div key={estado} style={s.estadoCard}>
                <div style={{
                  ...s.estadoDot,
                  background: ESTADOS_COLOR[estado] || "var(--muted-foreground)",
                }} />
                <div style={s.estadoLabel}>{ESTADOS_LABEL[estado] || estado}</div>
                <div style={s.estadoValue}>{count}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Skills más demandados */}
      <Section title="Skills más demandados en vacantes">
        {skillsTop.length === 0 ? (
          <EmptyText>Sin skills registrados todavía</EmptyText>
        ) : (
          <SkillsRanking items={skillsTop} color="var(--primary)" />
        )}
      </Section>

      {/* Skills de candidatos */}
      <Section title="Skills más comunes entre candidatos">
        {skillsCandidatos.length === 0 ? (
          <EmptyText>Sin candidatos con skills registrados</EmptyText>
        ) : (
          <SkillsRanking items={skillsCandidatos} color="var(--success)" />
        )}
      </Section>

      {/* Vacantes populares */}
      <Section title="Vacantes con más postulaciones">
        {vacantesTop.length === 0 ? (
          <EmptyText>Sin postulaciones registradas</EmptyText>
        ) : (
          <div style={s.vacantesList}>
            {vacantesTop.map((v, i) => (
              <div key={v.vacante_id} style={s.vacanteRow}>
                <div style={s.rankNumber}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.vacanteTitulo}>{v.titulo}</div>
                  <div style={s.vacanteEmpresa}>{v.empresa}</div>
                </div>
                <div style={s.vacanteCount}>
                  <span style={s.vacanteCountValue}>{v.total_postulaciones}</span>
                  <span style={s.vacanteCountLabel}>postulaciones</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Distribución educativa */}
      <Section title="Distribución por nivel educativo">
        {niveles.length === 0 ? (
          <EmptyText>Sin candidatos registrados</EmptyText>
        ) : (
          <div style={s.nivelesGrid}>
            {niveles.map((n) => (
              <div key={n.nivel} style={s.nivelCard}>
                <div style={s.nivelHeader}>
                  <span style={s.nivelLabel}>
                    {NIVELES_LABEL[n.nivel] || n.nivel}
                  </span>
                  <span style={s.nivelValue}>{n.count}</span>
                </div>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.barFill,
                    width: `${n.porcentaje}%`,
                    background: "var(--primary)",
                  }} />
                </div>
                <div style={s.nivelPct}>{n.porcentaje}%</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function KpiCard({ label, value, subtitle, color }) {
  return (
    <div style={s.kpiCard}>
      <div style={s.kpiLabel}>{label}</div>
      <div style={{ ...s.kpiValue, color: color || "var(--foreground)" }}>{value}</div>
      {subtitle && <div style={s.kpiSubtitle}>{subtitle}</div>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section} className="animate-slide-up">
      <h3 style={s.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

function EmptyText({ children }) {
  return <p style={s.emptyText}>{children}</p>
}

function SkillsRanking({ items, color }) {
  const maxCount = Math.max(...items.map((i) => i.count))
  return (
    <div style={s.skillsList}>
      {items.map((item, i) => (
        <div key={item.skill} style={s.skillRow}>
          <div style={s.skillRank}>{i + 1}</div>
          <div style={s.skillName}>{item.skill}</div>
          <div style={s.skillBarWrap}>
            <div style={s.barTrack}>
              <div style={{
                ...s.barFill,
                width: `${(item.count / maxCount) * 100}%`,
                background: color,
              }} />
            </div>
          </div>
          <div style={s.skillCount}>{item.count}</div>
          <div style={s.skillPct}>{item.porcentaje}%</div>
        </div>
      ))}
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
    marginBottom: 32,
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
  loading: { display: "flex", justifyContent: "center", padding: 80 },
  spinner: {
    width: 28, height: 28,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
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
  // KPIs
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 32,
  },
  kpiCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 26,
    boxShadow: "var(--shadow-sm)",
  },
  kpiLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    fontWeight: 500,
    marginBottom: 12,
    letterSpacing: "0.01em",
  },
  kpiValue: {
    fontSize: 44,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginTop: 8,
  },
  // Sección
  section: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 20,
    color: "var(--foreground)",
  },
  emptyText: {
    fontSize: 14,
    color: "var(--muted-foreground)",
    textAlign: "center",
    padding: "20px 0",
    fontStyle: "italic",
  },
  // Estados grid
  estadosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  estadoCard: {
    padding: 18,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
    position: "relative",
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginBottom: 10,
  },
  estadoLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    fontWeight: 500,
  },
  estadoValue: {
    fontSize: 28,
    fontWeight: 600,
    color: "var(--foreground)",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  // Skills ranking
  skillsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skillRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 4px",
  },
  skillRank: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    width: 24,
    flexShrink: 0,
  },
  skillName: {
    fontSize: 14,
    color: "var(--foreground)",
    fontWeight: 500,
    width: 140,
    flexShrink: 0,
    textTransform: "capitalize",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  skillBarWrap: {
    flex: 1,
    minWidth: 0,
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
  skillCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    width: 36,
    textAlign: "right",
    flexShrink: 0,
  },
  skillPct: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    width: 56,
    textAlign: "right",
    flexShrink: 0,
  },
  // Vacantes
  vacantesList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  vacanteRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 4px",
    borderBottom: "1px solid var(--border)",
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  vacanteTitulo: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
    letterSpacing: "-0.005em",
  },
  vacanteEmpresa: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  vacanteCount: {
    textAlign: "right",
    flexShrink: 0,
  },
  vacanteCountValue: {
    display: "block",
    fontSize: 22,
    fontWeight: 600,
    color: "var(--primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  vacanteCountLabel: {
    fontSize: 11,
    color: "var(--muted-foreground)",
  },
  // Niveles
  nivelesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  nivelCard: {
    padding: 16,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  nivelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nivelLabel: {
    fontSize: 13,
    color: "var(--foreground)",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  nivelValue: {
    fontSize: 14,
    color: "var(--foreground)",
    fontWeight: 600,
  },
  nivelPct: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginTop: 6,
    fontWeight: 500,
  },
}