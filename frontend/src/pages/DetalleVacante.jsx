import { useState, useEffect } from "react"
import { crearPostulacion } from "../api/postulaciones"
import { guardarFavorito, eliminarFavorito, esFavorito } from "../api/favoritos"

export default function DetalleVacante({ vacante, perfilId, onVolver }) {
  const [postulando, setPostulando] = useState(false)
  const [postulado, setPostulado] = useState(false)
  const [error, setError] = useState("")

  const [favorito, setFavorito] = useState(false)
  const [guardandoFav, setGuardandoFav] = useState(false)
  const [mensajeFav, setMensajeFav] = useState("")

  useEffect(() => {
    if (perfilId && vacante?.id) {
      esFavorito(perfilId, String(vacante.id))
        .then((res) => setFavorito(res.es_favorito))
        .catch(() => setFavorito(false))
    }
  }, [perfilId, vacante?.id])

  if (!vacante) return null

  const handlePostular = async () => {
    if (!perfilId) return
    setPostulando(true); setError("")
    try {
      await crearPostulacion({
        perfil_id: perfilId,
        vacante_id: String(vacante.id),
        tipo: "manual",
        score_match: vacante.score ? String(Math.round(vacante.score * 100)) : null,
      })
      setPostulado(true)
    } catch (err) { setError(err.message) }
    finally { setPostulando(false) }
  }

  const handleToggleFavorito = async () => {
    if (!perfilId) return
    setGuardandoFav(true); setMensajeFav("")
    try {
      if (favorito) {
        await eliminarFavorito(perfilId, String(vacante.id))
        setFavorito(false)
        setMensajeFav("Eliminada de favoritos")
      } else {
        await guardarFavorito(perfilId, String(vacante.id))
        setFavorito(true)
        setMensajeFav("Vacante guardada en favoritos")
      }
      setTimeout(() => setMensajeFav(""), 2500)
    } catch (err) {
      setMensajeFav(err.message)
    } finally {
      setGuardandoFav(false)
    }
  }

  const fmt = (min, max) => {
    if (!min && !max) return "No especificado"
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${f(min)} - ${f(max)} COP`
    return min ? `Desde ${f(min)} COP` : `Hasta ${f(max)} COP`
  }

  const requisitos = vacante.requisitos
    ? vacante.requisitos.split(";").map((s) => s.trim()).filter(Boolean)
    : []

  const colorScore = (score) => {
    if (score >= 0.7) return "var(--success)"
    if (score >= 0.4) return "var(--warning)"
    return "var(--muted-foreground)"
  }

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
          Vacantes
        </span>
        <span style={s.breadSep}>/</span>
        <span style={{ color: "var(--foreground)" }}>{vacante.titulo}</span>
      </div>

      {/* Card principal */}
      <div style={s.card} className="animate-slide-up">
        {/* Header */}
        <div style={s.header}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={s.title}>{vacante.titulo}</h1>
            <p style={s.empresa}>{vacante.empresa}</p>
          </div>

          <div style={s.headerActions}>
            {perfilId && (
              <button
                onClick={handleToggleFavorito}
                disabled={guardandoFav}
                style={favorito ? s.btnFavActive : s.btnFav}
                title={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                {favorito ? "Guardada" : "Guardar"}
              </button>
            )}

            {vacante.score !== undefined && (
              <div style={s.scoreBox}>
                <div style={{ ...s.scoreValue, color: colorScore(vacante.score) }}>
                  {Math.round(vacante.score * 100)}%
                </div>
                <div style={s.scoreLabel}>match</div>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje favorito */}
        {mensajeFav && (
          <div style={s.successFav} className="animate-fade-in">
            {mensajeFav}
          </div>
        )}

        {/* Meta grid */}
        <div style={s.metaGrid}>
          <MetaItem label="Ubicación" value={vacante.ubicacion} />
          <MetaItem label="Modalidad" value={vacante.modalidad} />
          <MetaItem label="Salario" value={fmt(vacante.salario_min, vacante.salario_max)} />
          <MetaItem label="Estado" value={vacante.estado} />
        </div>

        {/* Descripción */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Descripción</h3>
          <p style={s.descripcion}>
            {vacante.descripcion || "Sin descripción disponible."}
          </p>
        </div>

        {/* Requisitos */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Requisitos</h3>
          <div style={s.tags}>
            {requisitos.length > 0 ? (
              requisitos.map((r) => {
                const isMatch = vacante.skills_match?.includes(r.toLowerCase())
                return (
                  <span key={r} style={isMatch ? s.skillOk : s.skillNormal}>
                    {isMatch && <span style={s.checkMark}>✓</span>}
                    {r}
                  </span>
                )
              })
            ) : (
              <span style={s.muted}>No especificados</span>
            )}
          </div>
        </div>

        {/* Skills faltantes */}
        {vacante.skills_faltantes?.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Habilidades que te faltan</h3>
            <div style={s.tags}>
              {vacante.skills_faltantes.map((sk) => (
                <span key={sk} style={s.skillMiss}>{sk}</span>
              ))}
            </div>
            <p style={s.hint}>
              Desarrollar estas habilidades mejoraría tu match.
            </p>
          </div>
        )}

        {/* Acciones */}
        {error && <div style={s.error}>{error}</div>}

        <div style={s.actions}>
          {postulado ? (
            <span style={s.btnDone}>
              <span style={s.checkMarkLarge}>✓</span> Postulación enviada
            </span>
          ) : (
            <button
              onClick={handlePostular}
              disabled={postulando || !perfilId}
              style={{ ...s.btnPrimary, opacity: postulando ? 0.6 : 1 }}
              onMouseEnter={(e) => !postulando && (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              {postulando ? "Postulando..." : "Postularme a esta vacante"}
            </button>
          )}

          {vacante.url && (
            <a
              href={vacante.url}
              target="_blank"
              rel="noopener noreferrer"
              style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
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
    <div style={s.metaItem}>
      <div style={s.metaLabel}>{label}</div>
      <div style={{ ...s.metaValue, color: value ? "var(--foreground)" : "var(--muted-foreground)" }}>
        {value || "—"}
      </div>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 820,
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
  card: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 40,
    boxShadow: "var(--shadow-sm)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexShrink: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  empresa: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    fontWeight: 400,
  },
  scoreBox: {
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    marginTop: 4,
    fontWeight: 500,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 32,
    paddingBottom: 32,
    borderBottom: "1px solid var(--border)",
  },
  metaItem: {
    padding: 16,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  metaLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    fontWeight: 500,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 400,
  },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 14,
    color: "var(--foreground)",
  },
  descripcion: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "var(--foreground)",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  skillOk: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--success)",
    padding: "6px 14px",
    background: "var(--success-bg)",
    borderRadius: "var(--radius-full)",
  },
  skillNormal: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--foreground)",
    padding: "6px 14px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
  },
  skillMiss: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--warning)",
    padding: "6px 14px",
    background: "var(--warning-bg)",
    borderRadius: "var(--radius-full)",
  },
  checkMark: {
    fontSize: 12,
    fontWeight: 700,
  },
  checkMarkLarge: {
    fontSize: 16,
    fontWeight: 700,
  },
  hint: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginTop: 10,
    fontStyle: "italic",
  },
  muted: { color: "var(--muted-foreground)", fontSize: 14 },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  successFav: {
    color: "#1d7d3f",
    background: "var(--success-bg)",
    border: "1px solid rgba(52, 199, 89, 0.25)",
    borderRadius: "var(--radius-md)",
    padding: "10px 16px",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 32,
    paddingTop: 28,
    borderTop: "1px solid var(--border)",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "14px 32px",
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
    padding: "14px 28px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    transition: "background 0.2s ease",
  },
  btnDone: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 28px",
    border: "1px solid rgba(52, 199, 89, 0.3)",
    color: "var(--success)",
    background: "var(--success-bg)",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
  },
  btnFav: {
    padding: "10px 20px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnFavActive: {
    padding: "10px 20px",
    background: "var(--warning-bg)",
    color: "var(--warning)",
    border: "1px solid rgba(255, 149, 0, 0.3)",
    borderRadius: "var(--radius-full)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
}