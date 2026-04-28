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
    e.stopPropagation() // evitar que se abra el detalle
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
    day: "2-digit", month: "short", year: "numeric"
  }) : ""

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={s.title}>Mis favoritos</h1>
          <p style={s.subtitle}>
            {favoritos.length === 0
              ? "Vacantes que has guardado para revisar después"
              : `${favoritos.length} vacante${favoritos.length !== 1 ? "s" : ""} guardada${favoritos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={onVolver} style={s.btnSec}>&#8592; Volver</button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: 60, ...s.muted }}>Cargando favoritos...</p>
      ) : favoritos.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>★</div>
          <p style={{ marginBottom: 8 }}>Aún no tienes vacantes favoritas</p>
          <p style={s.muted}>
            Cuando veas una vacante interesante, presiona "☆ Guardar" para tenerla aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {favoritos.map((f) => (
            <div
              key={f.id}
              onClick={() => handleAbrirDetalle(f.vacante_id)}
              style={s.row}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={s.starIcon}>★</span>
                  <h3 style={{ fontSize: 16, margin: 0 }}>{f.vacante_titulo || "Vacante"}</h3>
                  <span style={s.muted}>{f.vacante_empresa}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {f.vacante_ubicacion && <span style={s.meta}>{f.vacante_ubicacion}</span>}
                  {f.vacante_modalidad && <span style={s.meta}>{f.vacante_modalidad}</span>}
                  {fmt(f.vacante_salario_min, f.vacante_salario_max) && (
                    <span style={s.meta}>{fmt(f.vacante_salario_min, f.vacante_salario_max)}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                  Guardada el {fmtFecha(f.created_at)}
                </div>
              </div>

              <button
                onClick={(e) => handleEliminar(e, f.vacante_id)}
                disabled={eliminandoId === f.vacante_id}
                style={s.btnRemove}
                title="Quitar de favoritos"
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
  container: { maxWidth: 860, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.4)" },
  muted: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  error: { color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  empty: { textAlign: "center", padding: 60 },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer", transition: "background 0.15s",
  },
  starIcon: { color: "rgba(251,191,36,0.95)", fontSize: 16 },
  meta: { fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.1)" },
  btnSec: { padding: "10px 20px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" },
  btnRemove: {
    padding: "8px 16px", background: "transparent", color: "rgba(248,113,113,0.8)",
    border: "1px solid rgba(248,113,113,0.2)", fontSize: 12, cursor: "pointer", flexShrink: 0,
  },
}