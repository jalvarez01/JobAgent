import { useState, useEffect } from "react"
import {
  analizarBrechas, listarSkillsAprendizaje,
  agregarSkillAprendizaje, eliminarSkillAprendizaje,
} from "../api/brechas"

export default function Brechas({ perfil, onVolver }) {
  const [data, setData] = useState(null)
  const [enAprendizaje, setEnAprendizaje] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actualizandoSkill, setActualizandoSkill] = useState(null)

  useEffect(() => {
    if (perfil?.id) cargar()
  }, [perfil?.id])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const [analisis, aprendizaje] = await Promise.all([
        analizarBrechas(perfil.id),
        listarSkillsAprendizaje(perfil.id),
      ])
      setData(analisis)
      setEnAprendizaje(aprendizaje.map((a) => a.skill))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAprendizaje = async (skill) => {
    setActualizandoSkill(skill)
    try {
      if (enAprendizaje.includes(skill)) {
        await eliminarSkillAprendizaje(perfil.id, skill)
        setEnAprendizaje((prev) => prev.filter((s) => s !== skill))
      } else {
        await agregarSkillAprendizaje(perfil.id, skill)
        setEnAprendizaje((prev) => [...prev, skill])
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setActualizandoSkill(null)
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
        <div style={s.error}>{error || "No se pudo analizar las brechas"}</div>
      </div>
    )
  }

  const skillsFaltantes = data.skills_faltantes || []
  const maxImpacto = skillsFaltantes.length > 0
    ? Math.max(...skillsFaltantes.map((sk) => sk.vacantes_desbloqueables))
    : 1

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Análisis de brechas</h1>
          <p style={s.subtitle}>
            Skills demandados por el mercado que aún no están en tu perfil
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

      {/* Resumen del análisis */}
      <div style={s.kpiGrid} className="animate-slide-up">
        <KpiCard
          label="Vacantes analizadas"
          value={data.total_vacantes_analizadas}
          color="var(--foreground)"
        />
        <KpiCard
          label="Tus skills"
          value={data.skills_usuario.length}
          color="var(--success)"
        />
        <KpiCard
          label="Skills faltantes"
          value={skillsFaltantes.length}
          color={skillsFaltantes.length === 0 ? "var(--success)" : "var(--warning)"}
        />
        <KpiCard
          label="En aprendizaje"
          value={enAprendizaje.length}
          color="var(--info)"
        />
      </div>

      {/* Estado del perfil */}
      {data.perfil_competitivo ? (
        <div style={s.competitivoCard} className="animate-slide-up">
          <div style={s.competitivoIcon}>✓</div>
          <div>
            <h3 style={s.competitivoTitle}>Perfil competitivo</h3>
            <p style={s.competitivoText}>{data.mensaje}</p>
          </div>
        </div>
      ) : (
        <>
          <div style={s.mensajeCard} className="animate-slide-up">
            <p style={s.mensajeText}>{data.mensaje}</p>
            <p style={s.hint}>
              Los skills están priorizados por impacto: cuántas vacantes adicionales podrías desbloquear al adquirirlos.
            </p>
          </div>

          {/* Lista de skills faltantes */}
          <div style={s.section} className="animate-slide-up">
            <h3 style={s.sectionTitle}>Skills que te faltan, priorizados por impacto</h3>
            <div style={s.skillsList}>
              {skillsFaltantes.map((sk, i) => {
                const enLista = enAprendizaje.includes(sk.skill)
                const actualizando = actualizandoSkill === sk.skill
                return (
                  <div
                    key={sk.skill}
                    style={{
                      ...s.skillRow,
                      borderColor: enLista ? "var(--info)" : "var(--border)",
                      background: enLista ? "var(--info-bg)" : "var(--card-solid)",
                    }}
                  >
                    <div style={s.skillRank}>{i + 1}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.skillHeader}>
                        <span style={s.skillName}>{sk.skill}</span>
                        {enLista && (
                          <span style={s.aprendiendoChip}>Aprendiendo</span>
                        )}
                      </div>
                      <div style={s.skillMetaRow}>
                        <span style={s.skillMeta}>
                          {sk.vacantes_que_lo_requieren} {sk.vacantes_que_lo_requieren === 1 ? "vacante lo pide" : "vacantes lo piden"}
                        </span>
                        <span style={s.skillMetaSep}>·</span>
                        <span style={s.skillMeta}>
                          {sk.porcentaje_demanda}% del mercado
                        </span>
                      </div>
                      <div style={s.barTrack}>
                        <div style={{
                          ...s.barFill,
                          width: `${(sk.vacantes_desbloqueables / maxImpacto) * 100}%`,
                          background: enLista ? "var(--info)" : "var(--primary)",
                        }} />
                      </div>
                    </div>

                    <div style={s.impactoBox}>
                      <div style={s.impactoValue}>+{sk.vacantes_desbloqueables}</div>
                      <div style={s.impactoLabel}>
                        {sk.vacantes_desbloqueables === 1 ? "vacante" : "vacantes"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAprendizaje(sk.skill)}
                      disabled={actualizando}
                      style={enLista ? s.btnRemoveAprendizaje : s.btnAddAprendizaje}
                      title={enLista ? "Quitar de aprendizaje" : "Marcar como en aprendizaje"}
                    >
                      {actualizando ? "..." : enLista ? "Quitar" : "Aprenderé esto"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Lista de skills en aprendizaje (si hay alguno marcado pero ya no aparece en faltantes) */}
      {enAprendizaje.length > 0 && (
        <div style={s.section} className="animate-slide-up">
          <h3 style={s.sectionTitle}>
            Skills que estás aprendiendo
          </h3>
          <p style={{ ...s.hint, marginBottom: 16 }}>
            Cuando agregues estos skills a tu perfil, desaparecerán automáticamente de esta lista.
          </p>
          <div style={s.aprendiendoGrid}>
            {enAprendizaje.map((skill) => (
              <span key={skill} style={s.aprendiendoTag}>
                {skill}
                <span
                  onClick={() => handleToggleAprendizaje(skill)}
                  style={s.tagX}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggleAprendizaje(skill)}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, color }) {
  return (
    <div style={s.kpiCard}>
      <div style={s.kpiLabel}>{label}</div>
      <div style={{ ...s.kpiValue, color }}>{value}</div>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 980,
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
    marginBottom: 16,
  },
  kpiCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  kpiLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    fontWeight: 500,
    marginBottom: 10,
    letterSpacing: "0.01em",
  },
  kpiValue: {
    fontSize: 40,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1,
  },
  // Perfil competitivo
  competitivoCard: {
    background: "var(--success-bg)",
    border: "1px solid rgba(52, 199, 89, 0.3)",
    borderRadius: "var(--radius-lg)",
    padding: 32,
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
  },
  competitivoIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--success)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 600,
    flexShrink: 0,
  },
  competitivoTitle: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 4,
    color: "var(--foreground)",
  },
  competitivoText: {
    fontSize: 15,
    color: "var(--foreground)",
    lineHeight: 1.5,
  },
  // Mensaje y secciones
  mensajeCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    marginTop: 16,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  mensajeText: {
    fontSize: 17,
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: 6,
    letterSpacing: "-0.005em",
  },
  hint: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  },
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
  // Skills list
  skillsList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  skillRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    transition: "all 0.2s ease",
  },
  skillRank: {
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
  skillHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--foreground)",
    letterSpacing: "-0.005em",
    textTransform: "capitalize",
  },
  aprendiendoChip: {
    fontSize: 11,
    color: "var(--info)",
    background: "rgba(90, 200, 250, 0.18)",
    padding: "2px 10px",
    borderRadius: "var(--radius-full)",
    fontWeight: 500,
  },
  skillMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  skillMeta: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  skillMetaSep: {
    color: "var(--muted-foreground)",
    opacity: 0.5,
  },
  barTrack: {
    width: "100%",
    height: 6,
    background: "rgba(0,0,0,0.06)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
  impactoBox: {
    textAlign: "center",
    flexShrink: 0,
    minWidth: 70,
  },
  impactoValue: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  impactoLabel: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    marginTop: 4,
  },
  btnAddAprendizaje: {
    padding: "8px 14px",
    background: "transparent",
    color: "var(--primary)",
    border: "1px solid var(--primary)",
    borderRadius: "var(--radius-full)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnRemoveAprendizaje: {
    padding: "8px 14px",
    background: "transparent",
    color: "var(--info)",
    border: "1px solid var(--info)",
    borderRadius: "var(--radius-full)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  // Aprendizaje pills
  aprendiendoGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  aprendiendoTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    background: "var(--info-bg)",
    color: "var(--info)",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
  },
  tagX: {
    cursor: "pointer",
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 1,
    transition: "opacity 0.2s",
  },
}