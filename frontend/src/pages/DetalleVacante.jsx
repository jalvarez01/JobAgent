import { useState } from "react"
import { crearPostulacion } from "../api/postulaciones"

export default function DetalleVacante({ vacante, perfilId, onVolver }) {
  const [postulando, setPostulando] = useState(false)
  const [postulado, setPostulado] = useState(false)
  const [error, setError] = useState("")

  if (!vacante) return null

  const handlePostular = async () => {
    if (!perfilId) return
    setPostulando(true); setError("")
    try {
      await crearPostulacion({
        perfil_id: perfilId, vacante_id: String(vacante.id),
        tipo: "manual", score_match: vacante.score ? String(Math.round(vacante.score * 100)) : null,
      })
      setPostulado(true)
    } catch (err) { setError(err.message) }
    finally { setPostulando(false) }
  }

  const fmt = (min, max) => {
    if (!min && !max) return "No especificado"
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${f(min)} - ${f(max)} COP`
    return min ? `Desde ${f(min)} COP` : `Hasta ${f(max)} COP`
  }

  const requisitos = vacante.requisitos ? vacante.requisitos.split(";").map((s) => s.trim()).filter(Boolean) : []

  return (
    <div style={s.container}>
      <span onClick={onVolver} style={s.back}>&#8592; Volver a vacantes</span>

      <div style={s.card}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, marginBottom: 8, letterSpacing: "-0.02em" }}>{vacante.titulo}</h1>
            <p style={s.muted}>{vacante.empresa}</p>
          </div>
          {vacante.score !== undefined && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36 }}>{Math.round(vacante.score * 100)}%</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>match</div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={s.metaGrid}>
          <MetaItem label="Ubicación" value={vacante.ubicacion} />
          <MetaItem label="Modalidad" value={vacante.modalidad} />
          <MetaItem label="Salario" value={fmt(vacante.salario_min, vacante.salario_max)} />
          <MetaItem label="Estado" value={vacante.estado} />
        </div>

        {/* Descripción */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Descripción</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
            {vacante.descripcion || "Sin descripción disponible."}
          </p>
        </div>

        {/* Requisitos */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Requisitos</h3>
          <div style={s.tags}>
            {requisitos.length > 0 ? requisitos.map((r) => {
              const isMatch = vacante.skills_match?.includes(r.toLowerCase())
              return (
                <span key={r} style={isMatch ? s.skillOk : s.skillNormal}>
                  {isMatch ? "✓ " : ""}{r}
                </span>
              )
            }) : <span style={s.muted}>No especificados</span>}
          </div>
        </div>

        {/* Skills faltantes */}
        {vacante.skills_faltantes?.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Skills que te faltan</h3>
            <div style={s.tags}>
              {vacante.skills_faltantes.map((sk) => <span key={sk} style={s.skillMiss}>{sk}</span>)}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8, fontStyle: "italic" }}>
              Desarrollar estas habilidades mejoraría tu match.
            </p>
          </div>
        )}

        {/* Acciones */}
        {error && <div style={s.error}>{error}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {postulado ? (
            <span style={s.btnDone}>Postulación enviada</span>
          ) : (
            <button onClick={handlePostular} disabled={postulando || !perfilId} style={s.btnPrimary}>
              {postulando ? "Postulando..." : "Postularme a esta vacante"}
            </button>
          )}
          {vacante.url && (
            <a href={vacante.url} target="_blank" rel="noopener noreferrer" style={s.btnSec}>
              Ver oferta original
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div style={{ padding: 14, background: "rgba(255,255,255,0.03)" }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value || "—"}</div>
    </div>
  )
}

const s = {
  container: { maxWidth: 760, margin: "0 auto", padding: "40px 24px" },
  back: { color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, display: "inline-block", marginBottom: 20 },
  card: { border: "1px solid rgba(255,255,255,0.1)", padding: 32 },
  muted: { color: "rgba(255,255,255,0.5)", fontSize: 16 },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  skillOk: { fontSize: 13, color: "rgba(74,222,128,0.9)", padding: "5px 12px", border: "1px solid rgba(74,222,128,0.25)" },
  skillNormal: { fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "5px 12px", border: "1px solid rgba(255,255,255,0.1)" },
  skillMiss: { fontSize: 13, color: "rgba(251,191,36,0.8)", padding: "5px 12px", border: "1px solid rgba(251,191,36,0.2)" },
  error: { color: "#ff6b6b", fontSize: 14, marginBottom: 12 },
  btnPrimary: { padding: "14px 28px", background: "#fff", color: "#000", border: "none", fontSize: 15, cursor: "pointer" },
  btnDone: { padding: "14px 28px", border: "1px solid rgba(74,222,128,0.3)", color: "rgba(74,222,128,0.9)", fontSize: 15 },
  btnSec: { padding: "14px 28px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 14, display: "inline-flex", alignItems: "center" },
}