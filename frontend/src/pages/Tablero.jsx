import { useState, useEffect } from "react"
import { listarPostulaciones, cambiarEstado, obtenerTrazas } from "../api/postulaciones"

const COLUMNAS = [
  { key: "postulado", label: "Postulado", accent: "rgba(99,102,241,0.8)" },
  { key: "en_revision", label: "En revisión", accent: "rgba(168,85,247,0.8)" },
  { key: "entrevista", label: "Entrevista", accent: "rgba(251,191,36,0.8)" },
  { key: "oferta", label: "Oferta", accent: "rgba(74,222,128,0.8)" },
  { key: "descartado", label: "Descartado", accent: "rgba(248,113,113,0.8)" },
]

export default function Tablero({ perfil, onVolver }) {
  const [postulaciones, setPostulaciones] = useState([])
  const [trazas, setTrazas] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState("tablero")

  useEffect(() => { if (perfil?.id) cargar() }, [perfil?.id])

  const cargar = async () => {
    setLoading(true)
    try {
      const [posts, logs] = await Promise.all([listarPostulaciones(perfil.id), obtenerTrazas(perfil.id, 30)])
      setPostulaciones(posts); setTrazas(logs)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCambiar = async (id, estado) => {
    try { await cambiarEstado(id, estado); await cargar() }
    catch (err) { alert(err.message) }
  }

  const porEstado = (estado) => postulaciones.filter((p) => p.estado === estado)

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""

  if (loading) return <div style={s.container}><p style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>Cargando...</p></div>

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={s.title}>Tablero</h1>
          <p style={s.subtitle}>Seguimiento de tus postulaciones</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setVista(vista === "tablero" ? "historial" : "tablero")} style={s.btnSec}>
            {vista === "tablero" ? "Historial" : "Tablero"}
          </button>
          <button onClick={onVolver} style={s.btnSec}>&#8592; Volver</button>
        </div>
      </div>

      {postulaciones.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p>No tienes postulaciones aún.</p>
          <p style={s.subtitle}>Postúlate desde las vacantes recomendadas.</p>
        </div>
      ) : vista === "tablero" ? (
        <div style={s.kanban}>
          {COLUMNAS.map((col) => {
            const items = porEstado(col.key)
            return (
              <div key={col.key} style={s.col}>
                <div style={{ ...s.colHeader, borderTopColor: col.accent }}>
                  <span style={{ fontSize: 13 }}>{col.label}</span>
                  <span style={s.badge}>{items.length}</span>
                </div>
                <div style={s.colBody}>
                  {items.map((p) => (
                    <div key={p.id} style={s.card}>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>{p.vacante_titulo || "Vacante"}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{p.vacante_empresa}</div>
                      {p.score_match && <span style={s.scorePill}>{p.score_match}%</span>}
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                        {p.tipo === "auto" ? "Auto" : "Manual"} · {fmtFecha(p.created_at)}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                        {col.key === "postulado" && <MiniBtn label="→ Revisión" onClick={() => handleCambiar(p.id, "en_revision")} />}
                        {col.key === "en_revision" && <MiniBtn label="→ Entrevista" onClick={() => handleCambiar(p.id, "entrevista")} />}
                        {col.key === "entrevista" && <MiniBtn label="→ Oferta" onClick={() => handleCambiar(p.id, "oferta")} green />}
                        {!["oferta", "descartado"].includes(col.key) && <MiniBtn label="Descartar" onClick={() => handleCambiar(p.id, "descartado")} red />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={s.timeline}>
          {trazas.length === 0 ? <p style={s.subtitle}>Sin actividad registrada.</p> : trazas.map((t) => (
            <div key={t.id} style={s.timelineItem}>
              <div style={s.dot} />
              <div>
                <div style={{ fontSize: 14 }}>{t.descripcion}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.origen} · {fmtFecha(t.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniBtn({ label, onClick, green, red }) {
  const color = green ? "rgba(74,222,128,0.8)" : red ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.6)"
  const border = green ? "rgba(74,222,128,0.2)" : red ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.15)"
  return <button onClick={onClick} style={{ fontSize: 11, padding: "3px 8px", background: "transparent", color, border: `1px solid ${border}`, cursor: "pointer" }}>{label}</button>
}

const s = {
  container: { maxWidth: 1060, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.4)" },
  btnSec: { padding: "8px 16px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" },
  kanban: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 },
  col: { flex: "1 0 180px", minWidth: 180 },
  colHeader: { padding: "10px 12px", borderTop: "2px solid", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  badge: { fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.07)", padding: "1px 7px" },
  colBody: { padding: "8px 0", display: "flex", flexDirection: "column", gap: 8, minHeight: 80 },
  card: { border: "1px solid rgba(255,255,255,0.08)", padding: 10 },
  scorePill: { fontSize: 11, color: "rgba(74,222,128,0.8)", border: "1px solid rgba(74,222,128,0.2)", padding: "1px 6px", display: "inline-block" },
  timeline: { borderLeft: "1px solid rgba(255,255,255,0.1)", marginLeft: 12, paddingLeft: 24 },
  timelineItem: { display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" },
  dot: { width: 6, height: 6, background: "#fff", flexShrink: 0, marginTop: 6, position: "absolute", left: -27 },
}