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
    if (score >= 0.7) return "var(--success)"
    if (score >= 0.4) return "var(--warning)"
    return "var(--muted-foreground)"
  }

  const labelScore = (score) => {
    if (score >= 0.7) return "Excelente match"
    if (score >= 0.4) return "Buen match"
    return "Match bajo"
  }

  return (
    <div style={s.container}>
      {/* Hero */}
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Vacantes</h1>
          <p style={s.subtitle}>
            {modo === "recomendadas"
              ? `Recomendadas para ti · ${perfil?.skills?.length || 0} habilidades en tu perfil`
              : `Resultados para "${busqueda}"`}
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

      {/* Barra de búsqueda */}
      <form onSubmit={handleBuscar} style={s.searchRow} className="animate-slide-up">
        <input
          type="text"
          placeholder="Buscar por título, empresa o habilidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          style={s.btnPrimary}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
        >
          Buscar
        </button>
        {modo === "busqueda" && (
          <button
            type="button"
            onClick={handleLimpiarBusqueda}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Ver recomendadas
          </button>
        )}
      </form>

      {/* Filtros */}
      <div style={s.filtros}>
        <select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)} style={{ width: 170 }}>
          <option value="">Modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>

        <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} style={{ width: 170 }}>
          <option value="">Ubicación</option>
          {UBICACIONES.filter(Boolean).map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        <select value={filtroSalario} onChange={(e) => setFiltroSalario(e.target.value)} style={{ width: 190 }}>
          {RANGOS_SALARIO.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        {(filtroModalidad || filtroUbicacion || filtroSalario) && (
          <span
            onClick={() => { setFiltroModalidad(""); setFiltroUbicacion(""); setFiltroSalario("") }}
            style={s.clearLink}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            Limpiar filtros
          </span>
        )}

        <span style={s.resultCount}>
          {vacantesFinales.length} resultado{vacantesFinales.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <div style={s.loading}>
          <div style={s.spinner} />
        </div>
      ) : vacantesFinales.length === 0 ? (
        <div style={s.empty}>
          <h3 style={s.emptyTitle}>No se encontraron vacantes</h3>
          <p style={s.muted}>
            {modo === "busqueda"
              ? "Intenta con otros términos de búsqueda."
              : "Agrega más habilidades a tu perfil para mejorar las recomendaciones."}
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {vacantesFinales.map((v) => (
            <div
              key={v.id}
              onClick={() => onVerDetalle(v)}
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rowHeader}>
                  <h3 style={s.vacanteTitle}>{v.titulo}</h3>
                  <span style={s.empresaSep}>·</span>
                  <span style={s.empresa}>{v.empresa}</span>
                </div>
                <div style={s.metaRow}>
                  {v.ubicacion && <span style={s.meta}>{v.ubicacion}</span>}
                  {v.modalidad && <span style={s.meta}>{v.modalidad}</span>}
                  {fmt(v.salario_min, v.salario_max) && <span style={s.meta}>{fmt(v.salario_min, v.salario_max)}</span>}
                </div>
                {v.skills_match && (
                  <div style={s.skillsRow}>
                    {v.skills_match?.map((sk) => <span key={sk} style={s.skillOk}>{sk}</span>)}
                    {v.skills_faltantes?.slice(0, 3).map((sk) => <span key={sk} style={s.skillMiss}>{sk}</span>)}
                  </div>
                )}
              </div>

              {v.score !== undefined && (
                <div style={s.scoreBox}>
                  <div style={{ ...s.scoreValue, color: colorScore(v.score) }}>
                    {Math.round(v.score * 100)}%
                  </div>
                  <div style={{ ...s.scoreLabel, color: colorScore(v.score) }}>
                    {labelScore(v.score)}
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
  muted: {
    color: "var(--muted-foreground)",
    fontSize: 15,
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
  searchRow: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },
  filtros: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  clearLink: {
    fontSize: 13,
    color: "var(--primary)",
    cursor: "pointer",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  resultCount: {
    marginLeft: "auto",
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: 80,
  },
  spinner: {
    width: 28,
    height: 28,
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 24px",
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    gap: 20,
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
  empresaSep: {
    color: "var(--muted-foreground)",
    fontSize: 14,
  },
  empresa: {
    fontSize: 15,
    color: "var(--muted-foreground)",
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  meta: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    padding: "3px 10px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
  },
  skillsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  skillOk: {
    fontSize: 11,
    color: "var(--success)",
    background: "var(--success-bg)",
    padding: "3px 10px",
    borderRadius: "var(--radius-full)",
    fontWeight: 500,
  },
  skillMiss: {
    fontSize: 11,
    color: "var(--warning)",
    background: "var(--warning-bg)",
    padding: "3px 10px",
    borderRadius: "var(--radius-full)",
    fontWeight: 500,
  },
  scoreBox: {
    textAlign: "center",
    flexShrink: 0,
    minWidth: 90,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: 500,
    marginTop: 4,
  },
  btnPrimary: {
    padding: "11px 22px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
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
}