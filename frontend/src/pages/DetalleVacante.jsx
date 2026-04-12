import { useState } from "react"
import { crearPostulacion } from "../api/postulaciones"

export default function DetalleVacante({ vacante, perfilId, onVolver }) {
  const [postulando, setPostulando] = useState(false)
  const [postulado, setPostulado] = useState(false)
  const [error, setError] = useState("")

  if (!vacante) return null

  const handlePostular = async () => {
    if (!perfilId) return
    setPostulando(true)
    setError("")
    try {
      await crearPostulacion({
        perfil_id: perfilId,
        vacante_id: String(vacante.id),
        tipo: "manual",
        score_match: vacante.score ? String(Math.round(vacante.score * 100)) : null,
      })
      setPostulado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setPostulando(false)
    }
  }

  const formatSalario = (min, max) => {
    if (!min && !max) return "No especificado"
    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${fmt(min)} - ${fmt(max)} COP`
    if (min) return `Desde ${fmt(min)} COP`
    return `Hasta ${fmt(max)} COP`
  }

  const requisitos = vacante.requisitos
    ? vacante.requisitos.split(";").map((s) => s.trim()).filter(Boolean)
    : []

  const scoreColor = (score) => {
    if (score >= 0.7) return "#059669"
    if (score >= 0.4) return "#d97706"
    return "#9ca3af"
  }

  return (
    <div style={styles.container}>
      <button onClick={onVolver} style={styles.btnVolver}>
        ← Volver a recomendaciones
      </button>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ flex: 1 }}>
            <h2 style={styles.titulo}>{vacante.titulo}</h2>
            <p style={styles.empresa}>{vacante.empresa}</p>
          </div>
          {vacante.score !== undefined && (
            <div style={{
              ...styles.scoreBadge,
              background: scoreColor(vacante.score),
            }}>
              {Math.round(vacante.score * 100)}% match
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={styles.metaGrid}>
          <MetaItem label="Ubicación" valor={vacante.ubicacion} />
          <MetaItem label="Modalidad" valor={vacante.modalidad} />
          <MetaItem label="Salario" valor={formatSalario(vacante.salario_min, vacante.salario_max)} />
          <MetaItem label="Estado" valor={vacante.estado} />
        </div>

        {/* Descripción */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Descripción</h3>
          <p style={styles.descripcion}>{vacante.descripcion || "Sin descripción disponible."}</p>
        </div>

        {/* Requisitos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Requisitos</h3>
          <div style={styles.skillsContainer}>
            {requisitos.length > 0 ? (
              requisitos.map((r) => {
                const isMatch = vacante.skills_match?.includes(r.toLowerCase())
                return (
                  <span
                    key={r}
                    style={isMatch ? styles.skillMatch : styles.skillNormal}
                  >
                    {isMatch ? "✓ " : ""}{r}
                  </span>
                )
              })
            ) : (
              <span style={{ color: "#999", fontSize: 14 }}>No especificados</span>
            )}
          </div>
        </div>

        {/* Skills faltantes */}
        {vacante.skills_faltantes?.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Skills que te faltan</h3>
            <div style={styles.skillsContainer}>
              {vacante.skills_faltantes.map((s) => (
                <span key={s} style={styles.skillMissing}>{s}</span>
              ))}
            </div>
            <p style={styles.tip}>
              Desarrollar estas habilidades mejoraría tu match con esta vacante.
            </p>
          </div>
        )}

        {/* Acciones */}
        {error && <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 8 }}>{error}</p>}
        <div style={styles.acciones}>
          {postulado ? (
            <span style={styles.btnPostulado}>Postulación enviada</span>
          ) : (
            <button
              onClick={handlePostular}
              disabled={postulando || !perfilId}
              style={styles.btnPostular}
            >
              {postulando ? "Postulando..." : "Postularme a esta vacante"}
            </button>
          )}
          {vacante.url && (
            <a
              href={vacante.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnExterno}
            >
              Ver oferta original
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, valor }) {
  return (
    <div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
      <p style={{ margin: "2px 0", fontSize: 14, fontWeight: 500, color: "#111827" }}>
        {valor || "—"}
      </p>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px",
    textAlign: "left",
  },
  btnVolver: {
    padding: "8px 16px",
    background: "none",
    color: "#2563eb",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 0,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    background: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    color: "#111827",
  },
  empresa: {
    fontSize: 16,
    color: "#6b7280",
    margin: "4px 0 0",
  },
  scoreBadge: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    padding: "8px 16px",
    borderRadius: 20,
    flexShrink: 0,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 16,
    padding: "16px 0",
    borderTop: "1px solid #f3f4f6",
    borderBottom: "1px solid #f3f4f6",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#374151",
    margin: "0 0 8px",
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#4b5563",
    margin: 0,
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  skillMatch: {
    fontSize: 13,
    color: "#065f46",
    background: "#d1fae5",
    padding: "4px 12px",
    borderRadius: 16,
    fontWeight: 500,
  },
  skillNormal: {
    fontSize: 13,
    color: "#374151",
    background: "#f3f4f6",
    padding: "4px 12px",
    borderRadius: 16,
  },
  skillMissing: {
    fontSize: 13,
    color: "#92400e",
    background: "#fef3c7",
    padding: "4px 12px",
    borderRadius: 16,
  },
  tip: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  acciones: {
    display: "flex",
    gap: 12,
    paddingTop: 16,
    borderTop: "1px solid #f3f4f6",
  },
  btnPostular: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },
  btnPostulado: {
    padding: "12px 24px",
    background: "#d1fae5",
    color: "#065f46",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
  },
  btnExterno: {
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
  },
}
