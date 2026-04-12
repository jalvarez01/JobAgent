import { useState, useEffect } from "react"
import { listarTodasVacantes, crearVacante, actualizarVacante, eliminarVacante } from "../api/vacantes"

const MODALIDADES = [
  { value: "", label: "Seleccionar..." }, { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" }, { value: "hibrido", label: "Híbrido" },
]
const ESTADOS = [
  { value: "activa", label: "Activa" }, { value: "cerrada", label: "Cerrada" }, { value: "pausada", label: "Pausada" },
]
const FORM_VACIO = { titulo: "", empresa: "", ubicacion: "", modalidad: "", salario_min: "", salario_max: "", descripcion: "", requisitos: "", url: "", estado: "activa" }

export default function AdminVacantes({ onVolver }) {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState("lista")
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try { setVacantes(await listarTodasVacantes()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleNueva = () => { setForm({ ...FORM_VACIO }); setEditandoId(null); setError(""); setMensaje(""); setVista("form") }

  const handleEditar = (v) => {
    setForm({ titulo: v.titulo||"", empresa: v.empresa||"", ubicacion: v.ubicacion||"", modalidad: v.modalidad||"", salario_min: v.salario_min??"", salario_max: v.salario_max??"", descripcion: v.descripcion||"", requisitos: v.requisitos||"", url: v.url||"", estado: v.estado||"activa" })
    setEditandoId(v.id); setError(""); setMensaje(""); setVista("form")
  }

  const handleEliminar = async (id, titulo) => {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return
    try { await eliminarVacante(id); setMensaje("Eliminada"); await cargar() }
    catch (err) { setError(err.message) }
  }

  const handleChange = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setMensaje("")
    const payload = { ...form, salario_min: form.salario_min !== "" ? Number(form.salario_min) : null, salario_max: form.salario_max !== "" ? Number(form.salario_max) : null, modalidad: form.modalidad || null, ubicacion: form.ubicacion || null, url: form.url || null }
    try {
      if (editandoId) { await actualizarVacante(editandoId, payload); setMensaje("Actualizada") }
      else { await crearVacante(payload); setMensaje("Creada") }
      await cargar(); setVista("lista")
    } catch (err) { setError(err.message) }
  }

  const filtradas = busqueda
    ? vacantes.filter((v) => v.titulo.toLowerCase().includes(busqueda.toLowerCase()) || v.empresa.toLowerCase().includes(busqueda.toLowerCase()) || (v.requisitos||"").toLowerCase().includes(busqueda.toLowerCase()))
    : vacantes

  const fmtSalario = (min, max) => {
    if (!min && !max) return "—"
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    return min && max ? `${f(min)} - ${f(max)}` : min ? `Desde ${f(min)}` : `Hasta ${f(max)}`
  }

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={s.title}>Administración</h1>
          <p style={s.subtitle}>{vacantes.length} vacantes registradas</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {vista === "lista" && <button onClick={handleNueva} style={s.btnPrimary}>+ Nueva vacante</button>}
          <button onClick={onVolver} style={s.btnSec}>&#8592; Volver</button>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {mensaje && <div style={s.success}>{mensaje}</div>}

      {/* ═══ LISTA ═══ */}
      {vista === "lista" && (
        <div>
          <input type="text" placeholder="Buscar por título, empresa o requisitos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ marginBottom: 20 }} />

          {loading ? (
            <p style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <p>No hay vacantes{busqueda ? " que coincidan" : ""}</p>
              <button onClick={handleNueva} style={{ ...s.btnPrimary, marginTop: 16 }}>Crear la primera</button>
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {filtradas.map((v, i) => (
                <div key={v.id} style={{ ...s.row, borderBottom: i < filtradas.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{v.titulo}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{v.empresa}</div>
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{v.ubicacion || "—"}</div>
                  <div style={{ flex: 1 }}>{v.modalidad ? <span style={s.meta}>{v.modalidad}</span> : "—"}</div>
                  <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{fmtSalario(v.salario_min, v.salario_max)}</div>
                  <div style={{ flex: 0.6 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", color: v.estado === "activa" ? "rgba(74,222,128,0.9)" : "rgba(248,113,113,0.8)", border: `1px solid ${v.estado === "activa" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}` }}>{v.estado}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEditar(v)} style={s.btnMini}>Editar</button>
                    <button onClick={() => handleEliminar(v.id, v.titulo)} style={s.btnMiniDanger}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FORMULARIO ═══ */}
      {vista === "form" && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h3 style={{ fontSize: 20, marginBottom: 24 }}>{editandoId ? "Editar vacante" : "Nueva vacante"}</h3>

          <div style={s.grid2}>
            <Fld label="Título del cargo *" name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Desarrollador Backend Python" />
            <Fld label="Empresa *" name="empresa" value={form.empresa} onChange={handleChange} required placeholder="Ej: Rappi" />
          </div>
          <div style={s.grid2}>
            <Fld label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín" />
            <div style={s.fieldWrap}><label style={s.label}>Modalidad</label><select name="modalidad" value={form.modalidad} onChange={handleChange}>{MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
          </div>
          <div style={s.grid2}>
            <Fld label="Salario mínimo (COP)" name="salario_min" type="number" value={form.salario_min} onChange={handleChange} placeholder="4000000" />
            <Fld label="Salario máximo (COP)" name="salario_max" type="number" value={form.salario_max} onChange={handleChange} placeholder="7000000" />
          </div>
          <div style={s.fieldWrap}><label style={s.label}>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Responsabilidades del puesto..." style={{ resize: "vertical" }} /></div>
          <div style={s.fieldWrap}>
            <label style={s.label}>Requisitos / Skills</label>
            <input name="requisitos" value={form.requisitos} onChange={handleChange} placeholder="Separados por ; → python;fastapi;docker" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>Estos skills se usan para el matching con candidatos</span>
          </div>
          {form.requisitos && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 16px" }}>
              {form.requisitos.split(";").filter(sk => sk.trim()).map((sk) => <span key={sk.trim()} style={s.skillTag}>{sk.trim()}</span>)}
            </div>
          )}
          <div style={s.grid2}>
            <Fld label="URL de la oferta" name="url" value={form.url} onChange={handleChange} placeholder="https://..." />
            <div style={s.fieldWrap}><label style={s.label}>Estado</label><select name="estado" value={form.estado} onChange={handleChange}>{ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}</select></div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setVista("lista"); setError(""); setMensaje("") }} style={s.btnSec}>Cancelar</button>
            <button type="submit" style={s.btnPrimary}>{editandoId ? "Guardar cambios" : "Crear vacante"}</button>
          </div>
        </form>
      )}
    </div>
  )
}

function Fld({ label, name, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
    </div>
  )
}

const s = {
  container: { maxWidth: 960, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)" },
  error: { color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  success: { color: "rgba(74,222,128,0.9)", border: "1px solid rgba(74,222,128,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  row: { display: "flex", alignItems: "center", padding: "14px 16px", gap: 10, transition: "background 0.15s" },
  meta: { fontSize: 11, padding: "2px 8px", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" },
  btnPrimary: { padding: "12px 24px", background: "#fff", color: "#000", border: "none", fontSize: 14, cursor: "pointer" },
  btnSec: { padding: "10px 20px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer" },
  btnMini: { fontSize: 12, padding: "4px 10px", background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" },
  btnMiniDanger: { fontSize: 12, padding: "4px 10px", background: "transparent", color: "rgba(248,113,113,0.8)", border: "1px solid rgba(248,113,113,0.2)", cursor: "pointer" },
  formCard: { border: "1px solid rgba(255,255,255,0.1)", padding: 32 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" },
  skillTag: { fontSize: 12, padding: "4px 12px", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" },
}