import { useState, useEffect } from "react"
import { listarFavoritos, eliminarFavorito } from "../api/favoritos"
import { obtenerVacante } from "../api/vacantes"

export default function Favoritos({ perfil, onVerDetalle, onVolver }) {
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [eliminandoId, setEliminandoId] = useState(null)

  useEffect(() => {
    if (perfil?.id) cargar()
  }, [perfil?.id])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const data = await listarFavoritos(perfil.id)
      setFavoritos(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleEliminar = async (e, vacante_id) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar esta vacante de tus favoritos?")) return
    setEliminandoId(vacante_id)
    try {
      await eliminarFavorito(perfil.id, vacante_id)
      await cargar()
    } catch (err) {
      alert(err.message)
    } finally {
      setEliminandoId(null)
    }
  }

  const handleAbrirDetalle = async (vacante_id) => {
    try {
      const vacante = await obtenerVacante(vacante_id)
      if (onVerDetalle) onVerDetalle(vacante)
    } catch (err) {
      alert("No se pudo abrir la vacante: " + err.message)
    }
  }

  const fmt = (min, max) => {
    if (!min && !max) return null
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${f(min)} - ${f(max)}`
    return min ? `Desde ${f(min)}` : `Hasta ${f(max)}`
  }

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }) : ""

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Mis favoritos</h1>
          <p style={s.subtitle}>
            {favoritos.length === 0
              ? "Vacantes que has guardado para revisar después"
              : `${favoritos.length} vacante${favoritos.length !== 1 ? "s" : ""} guardada${favoritos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
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

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /></div>
      ) : favoritos.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>★</div>
          <h3 style={s.emptyTitle}>Aún no tienes vacantes favoritas</h3>
          <p style={s.muted}>
            Cuando veas una vacante interesante, presiona el botón "Guardar" en su detalle para tenerla aquí.
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {favoritos.map((f) => (
            <div
              key={f.id}
              onClick={() => handleAbrirDetalle(f.vacante_id)}
              style={s.row}
              className="animate-slide-up"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,1)"
                e.currentTarget.style.boxShadow = "var(--shadow-md)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--card)"
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
            >
              <div style={s.starWrap}>
                <span style={s.starIcon}>★</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rowHeader}>
                  <h3 style={s.vacanteTitle}>{f.vacante_titulo || "Vacante"}</h3>
                  {f.vacante_empresa && (
                    <>
                      <span style={s.sep}>·</span>
                      <span style={s.empresa}>{f.vacante_empresa}</span>
                    </>
                  )}
                </div>
                <div style={s.metaRow}>
                  {f.vacante_ubicacion && <span style={s.meta}>{f.vacante_ubicacion}</span>}
                  {f.vacante_modalidad && <span style={s.meta}>{f.vacante_modalidad}</span>}
                  {fmt(f.vacante_salario_min, f.vacante_salario_max) && (
                    <span style={s.meta}>{fmt(f.vacante_salario_min, f.vacante_salario_max)}</span>
                  )}
                </div>
                <div style={s.fechaTxt}>
                  Guardada el {fmtFecha(f.created_at)}
                </div>
              </div>

              <button
                onClick={(e) => handleEliminar(e, f.vacante_id)}
                disabled={eliminandoId === f.vacante_id}
                style={s.btnRemove}
                title="Quitar de favoritos"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--destructive-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {eliminandoId === f.vacante_id ? "..." : "Quitar"}
              </button>
            </div>
          ))}
        </div>
      )}
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
  },
  muted: { color: "var(--muted-foreground)", fontSize: 15 },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
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
  loading: { display: "flex", justifyContent: "center", padding: 80 },
  spinner: {
    width: 28, height: 28,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center",
    padding: 80,
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  },
  emptyIcon: {
    fontSize: 48,
    color: "var(--warning)",
    opacity: 0.4,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "22px 24px",
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  starWrap: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "var(--warning-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  starIcon: {
    color: "var(--warning)",
    fontSize: 18,
  },
  rowHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  vacanteTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--foreground)",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sep: { color: "var(--muted-foreground)", fontSize: 14 },
  empresa: { fontSize: 15, color: "var(--muted-foreground)" },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    padding: "3px 10px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
  },
  fechaTxt: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  btnRemove: {
    padding: "8px 18px",
    background: "transparent",
    color: "var(--destructive)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-full)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.2s ease",
  },
}