import { useState, useEffect } from "react"
import { obtenerRecomendaciones, listarVacantes } from "../api/vacantes"

const UBICACIONES = ["", "Bogotá", "Medellín"]
const RANGOS_SALARIO = [
  { value: "", label: "Cualquier salario" },
  { value: "0-3000000", label: "Hasta $3M" },
  { value: "3000000-5000000", label: "$3M - $5M" },
  { value: "5000000-8000000", label: "$5M - $8M" },
  { value: "8000000-99999999", label: "Más de $8M" },
]

export default function Recomendaciones({ perfil, onVerDetalle, onVolver }) {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [busqueda, setBusqueda] = useState("")
  const [modo, setModo] = useState("recomendadas")

  const [filtroModalidad, setFiltroModalidad] = useState("")
  const [filtroUbicacion, setFiltroUbicacion] = useState("")
  const [filtroSalario, setFiltroSalario] = useState("")

  useEffect(() => {
    if (perfil?.id) cargar()
  }, [perfil?.id, filtroModalidad, filtroUbicacion, modo])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      let data
      if (modo === "busqueda" && busqueda.trim()) {
        data = await listarVacantes(busqueda.trim())
      } else {
        data = await obtenerRecomendaciones(perfil.id, {
          limit: 20,
          modalidad: filtroModalidad || undefined,
          ubicacion: filtroUbicacion || undefined,
        })
      }
      setVacantes(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    if (busqueda.trim()) {
      setModo("busqueda")
      cargar()
    }
  }

  const handleLimpiarBusqueda = () => {
    setBusqueda("")
    setModo("recomendadas")
  }

  const filtrarPorSalario = (lista) => {
    if (!filtroSalario) return lista
    const [min, max] = filtroSalario.split("-").map(Number)
    return lista.filter((v) => {
      if (!v.salario_min && !v.salario_max) return false
      const vMax = v.salario_max || v.salario_min || 0
      const vMin = v.salario_min || 0
      return vMax >= min && vMin <= max
    })
  }

  const filtrarPorUbicacion = (lista) => {
    if (!filtroUbicacion || modo === "recomendadas") return lista
    return lista.filter((v) => v.ubicacion && v.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()))
  }

  const filtrarPorModalidad = (lista) => {
    if (!filtroModalidad || modo === "recomendadas") return lista
    return lista.filter((v) => v.modalidad && v.modalidad.toLowerCase() === filtroModalidad.toLowerCase())
  }

  const vacantesFinales = filtrarPorSalario(filtrarPorUbicacion(filtrarPorModalidad(vacantes)))

  const fmt = (min, max) => {
    if (!min && !max) return null
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${f(min)} - ${f(max)}`
    return min ? `Desde ${f(min)}` : `Hasta ${f(max)}`
  }

  const colorScore = (score) => {
    if (score >= 0.7) return "#059669"
    if (score >= 0.4) return "#d97706"
    return "rgba(0,0,0,0.4)"
  }

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={s.title}>Vacantes</h1>
          <p style={s.subtitle}>
            {modo === "recomendadas"
              ? `Recomendadas para ti · ${perfil?.skills?.length || 0} skills`
              : `Resultados para "${busqueda}"`}
          </p>
        </div>
        <button onClick={onVolver} style={s.btnSec}>← Mi perfil</button>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleBuscar} style={s.searchRow}>
        <input
          type="text"
          placeholder="Buscar por título, empresa o skill..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" style={s.btnPrimary}>Buscar</button>
        {modo === "busqueda" && (
          <button type="button" onClick={handleLimpiarBusqueda} style={s.btnSec}>
            Ver recomendadas
          </button>
        )}
      </form>

      {/* Filtros */}
      <div style={s.filtros}>
        <select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)} style={{ width: 160 }}>
          <option value="">Modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>

        <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} style={{ width: 160 }}>
          <option value="">Ubicación</option>
          {UBICACIONES.filter(Boolean).map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        <select value={filtroSalario} onChange={(e) => setFiltroSalario(e.target.value)} style={{ width: 180 }}>
          {RANGOS_SALARIO.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        {(filtroModalidad || filtroUbicacion || filtroSalario) && (
          <span
            onClick={() => { setFiltroModalidad(""); setFiltroUbicacion(""); setFiltroSalario("") }}
            style={{ ...s.muted, cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.3)" }}
          >
            Limpiar filtros
          </span>
        )}

        <span style={{ ...s.muted, marginLeft: "auto" }}>
          {vacantesFinales.length} resultado{vacantesFinales.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: 60, ...s.muted }}>Cargando...</p>
      ) : vacantesFinales.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ marginBottom: 8, color: "#1a1a1a" }}>No se encontraron vacantes</p>
          <p style={s.muted}>
            {modo === "busqueda"
              ? "Intenta con otros términos de búsqueda."
              : "Agrega más skills a tu perfil para mejorar las recomendaciones."}
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {vacantesFinales.map((v) => (
            <div
              key={v.id}
              onClick={() => onVerDetalle(v)}
              style={s.row}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, margin: 0, color: "#1a1a1a", fontWeight: 500 }}>{v.titulo}</h3>
                  <span style={s.muted}>· {v.empresa}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {v.ubicacion && <span style={s.meta}>{v.ubicacion}</span>}
                  {v.modalidad && <span style={s.meta}>{v.modalidad}</span>}
                  {fmt(v.salario_min, v.salario_max) && <span style={s.meta}>{fmt(v.salario_min, v.salario_max)}</span>}
                </div>
                {v.skills_match && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {v.skills_match?.map((sk) => <span key={sk} style={s.skillOk}>{sk}</span>)}
                    {v.skills_faltantes?.slice(0, 3).map((sk) => <span key={sk} style={s.skillMiss}>{sk}</span>)}
                  </div>
                )}
              </div>

              {v.score !== undefined && (
                <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 20 }}>
                  <div style={{ fontSize: 28, fontWeight: 500, color: "#1a1a1a" }}>{Math.round(v.score * 100)}%</div>
                  <div style={{ fontSize: 11, color: colorScore(v.score), fontWeight: 500 }}>
                    {v.score >= 0.7 ? "Alto" : v.score >= 0.4 ? "Medio" : "Bajo"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  container: { maxWidth: 860, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em", color: "#1a1a1a" },
  subtitle: { fontSize: 16, color: "rgba(0,0,0,0.55)" },
  muted: { color: "rgba(0,0,0,0.55)", fontSize: 14 },
  error: { color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)", background: "#fef2f2", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  searchRow: { display: "flex", gap: 10, marginBottom: 16 },
  filtros: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  list: {
    display: "flex", flexDirection: "column", gap: 8,
    border: "1px solid rgba(0,0,0,0.1)", background: "#fff",
  },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)",
    cursor: "pointer", transition: "background 0.15s", background: "#fff",
  },
  meta: {
    fontSize: 12, color: "rgba(0,0,0,0.6)",
    padding: "2px 8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fafafa",
  },
  skillOk: {
    fontSize: 11, color: "#059669",
    padding: "2px 8px", border: "1px solid rgba(5,150,105,0.25)", background: "#d1fae5",
  },
  skillMiss: {
    fontSize: 11, color: "#92400e",
    padding: "2px 8px", border: "1px solid rgba(146,64,14,0.2)", background: "#fef3c7",
  },
  btnPrimary: { padding: "10px 20px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 14, cursor: "pointer" },
  btnSec: { padding: "10px 20px", background: "#fff", color: "#1a1a1a", border: "1px solid rgba(0,0,0,0.15)", fontSize: 13, cursor: "pointer" },
}