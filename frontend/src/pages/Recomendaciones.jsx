import { useState, useEffect } from "react"
import { obtenerRecomendaciones } from "../api/vacantes"

export default function Recomendaciones({ perfil, onVerDetalle, onVolver }) {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtroModalidad, setFiltroModalidad] = useState("")

  useEffect(() => {
    if (!perfil?.id) return
    cargarRecomendaciones()
  }, [perfil?.id, filtroModalidad])

  const cargarRecomendaciones = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await obtenerRecomendaciones(perfil.id, {
        limit: 20,
        modalidad: filtroModalidad || undefined,
      })
      setVacantes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatSalario = (min, max) => {
    if (!min && !max) return null
    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `Desde ${fmt(min)}`
    return `Hasta ${fmt(max)}`
  }

  const scoreColor = (score) => {
    if (score >= 0.7) return "#059669"
    if (score >= 0.4) return "#d97706"
    return "#9ca3af"
  }

  const scoreLabel = (score) => {
    if (score >= 0.7) return "Alto"
    if (score >= 0.4) return "Medio"
    return "Bajo"
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Vacantes recomendadas</h2>
          <p style={styles.subtitle}>
            Basado en tu perfil: {perfil.skills?.length || 0} skills detectados
          </p>
        </div>
        <button onClick={onVolver} style={styles.btnSecundario}>← Mi perfil</button>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <select
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas las modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <span style={styles.count}>
          {vacantes.length} vacante{vacantes.length !== 1 ? "s" : ""} encontrada{vacantes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: "center", color: "#999", padding: 40 }}>Cargando recomendaciones...</p>
      ) : vacantes.length === 0 ? (
        <div style={styles.empty}>
          <p>No se encontraron vacantes que coincidan con tu perfil.</p>
          <p style={{ fontSize: 14, color: "#999" }}>
            Intenta agregar más skills a tu perfil para mejorar las recomendaciones.
          </p>
        </div>
      ) : (
        <div style={styles.lista}>
          {vacantes.map((v) => (
            <div
              key={v.id}
              style={styles.card}
              onClick={() => onVerDetalle(v)}
            >
              <div style={styles.cardHeader}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{v.titulo}</h3>
                  <p style={styles.cardEmpresa}>{v.empresa}</p>
                </div>
                <div style={styles.scoreBadge}>
                  <span style={{
                    ...styles.scoreCircle,
                    background: scoreColor(v.score),
                  }}>
                    {Math.round(v.score * 100)}%
                  </span>
                  <span style={{ fontSize: 11, color: scoreColor(v.score) }}>
                    {scoreLabel(v.score)}
                  </span>
                </div>
              </div>

              <div style={styles.cardMeta}>
                {v.ubicacion && <span style={styles.metaTag}>{v.ubicacion}</span>}
                {v.modalidad && <span style={styles.metaTag}>{v.modalidad}</span>}
                {formatSalario(v.salario_min, v.salario_max) && (
                  <span style={styles.metaTag}>{formatSalario(v.salario_min, v.salario_max)}</span>
                )}
              </div>

              {/* Skills match */}
              <div style={{ marginTop: 8 }}>
                {v.skills_match?.length > 0 && (
                  <div style={styles.skillsRow}>
                    {v.skills_match.map((s) => (
                      <span key={s} style={styles.skillMatch}>{s}</span>
                    ))}
                  </div>
                )}
                {v.skills_faltantes?.length > 0 && (
                  <div style={{ ...styles.skillsRow, marginTop: 4 }}>
                    {v.skills_faltantes.slice(0, 4).map((s) => (
                      <span key={s} style={styles.skillMissing}>{s}</span>
                    ))}
                    {v.skills_faltantes.length > 4 && (
                      <span style={styles.skillMissing}>+{v.skills_faltantes.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "24px 16px",
    textAlign: "left",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    margin: "4px 0 0",
  },
  filtros: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  select: {
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
  },
  count: {
    fontSize: 13,
    color: "#9ca3af",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "8px 12px",
    borderRadius: 6,
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#6b7280",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    background: "#fff",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    color: "#111827",
  },
  cardEmpresa: {
    fontSize: 14,
    color: "#6b7280",
    margin: "2px 0 0",
  },
  scoreBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  scoreCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: "50%",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  cardMeta: {
    display: "flex",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  metaTag: {
    fontSize: 12,
    color: "#4b5563",
    background: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: 4,
  },
  skillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  skillMatch: {
    fontSize: 11,
    color: "#065f46",
    background: "#d1fae5",
    padding: "2px 8px",
    borderRadius: 10,
  },
  skillMissing: {
    fontSize: 11,
    color: "#92400e",
    background: "#fef3c7",
    padding: "2px 8px",
    borderRadius: 10,
  },
  btnSecundario: {
    padding: "8px 16px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    flexShrink: 0,
  },
}
