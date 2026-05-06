import { useState, useEffect } from "react"
import {
  listarTodasEntrevistas, crearEntrevista,
  actualizarEntrevista, eliminarEntrevista,
} from "../api/entrevistas"
import { listarPerfiles } from "../api/perfil"
import { listarTodasVacantes } from "../api/vacantes"

const TIPOS = [
  { value: "tecnica", label: "Técnica" },
  { value: "hr", label: "Recursos Humanos" },
  { value: "final", label: "Final" },
  { value: "cultural", label: "Cultural" },
]
const ESTADOS = [
  { value: "programada", label: "Programada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
]

const FORM_VACIO = {
  perfil_id: "", vacante_id: "", fecha_entrevista: "",
  tipo: "tecnica", entrevistador: "", duracion_minutos: "",
  estado: "programada",
  puntaje_tecnico: "", puntaje_comunicacion: "",
  puntaje_conocimientos: "", puntaje_actitud: "",
  fortalezas: "", debilidades: "", recomendaciones: "", notas_admin: "",
}

export default function AdminEntrevistas({ onVolver }) {
  const [entrevistas, setEntrevistas] = useState([])
  const [perfiles, setPerfiles] = useState([])
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState("lista")
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const [ents, pers, vacs] = await Promise.all([
        listarTodasEntrevistas(),
        listarPerfiles(),
        listarTodasVacantes(),
      ])
      setEntrevistas(ents); setPerfiles(pers); setVacantes(vacs)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleNueva = () => {
    setForm({ ...FORM_VACIO }); setEditandoId(null)
    setError(""); setMensaje(""); setVista("form")
  }

  const handleEditar = (ent) => {
    setForm({
      perfil_id: ent.perfil_id,
      vacante_id: ent.vacante_id || "",
      fecha_entrevista: ent.fecha_entrevista ? ent.fecha_entrevista.slice(0, 16) : "",
      tipo: ent.tipo, entrevistador: ent.entrevistador || "",
      duracion_minutos: ent.duracion_minutos ?? "",
      estado: ent.estado,
      puntaje_tecnico: ent.puntaje_tecnico ?? "",
      puntaje_comunicacion: ent.puntaje_comunicacion ?? "",
      puntaje_conocimientos: ent.puntaje_conocimientos ?? "",
      puntaje_actitud: ent.puntaje_actitud ?? "",
      fortalezas: ent.fortalezas || "", debilidades: ent.debilidades || "",
      recomendaciones: ent.recomendaciones || "", notas_admin: ent.notas_admin || "",
    })
    setEditandoId(ent.id); setError(""); setMensaje(""); setVista("form")
  }

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar la entrevista de "${nombre}"?`)) return
    try {
      await eliminarEntrevista(id)
      setMensaje("Entrevista eliminada")
      await cargar()
    } catch (err) { setError(err.message) }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setMensaje("")

    if (!form.perfil_id) return setError("Selecciona un candidato")

    const payload = {
      ...form,
      vacante_id: form.vacante_id || null,
      duracion_minutos: form.duracion_minutos !== "" ? Number(form.duracion_minutos) : null,
      puntaje_tecnico: form.puntaje_tecnico !== "" ? Number(form.puntaje_tecnico) : null,
      puntaje_comunicacion: form.puntaje_comunicacion !== "" ? Number(form.puntaje_comunicacion) : null,
      puntaje_conocimientos: form.puntaje_conocimientos !== "" ? Number(form.puntaje_conocimientos) : null,
      puntaje_actitud: form.puntaje_actitud !== "" ? Number(form.puntaje_actitud) : null,
      fecha_entrevista: form.fecha_entrevista || null,
    }

    try {
      if (editandoId) {
        await actualizarEntrevista(editandoId, payload)
        setMensaje("Entrevista actualizada correctamente")
      } else {
        await crearEntrevista(payload)
        setMensaje("Entrevista creada correctamente")
      }
      await cargar(); setVista("lista")
    } catch (err) { setError(err.message) }
  }

  const filtradas = entrevistas
    .filter(e => filtroEstado ? e.estado === filtroEstado : true)
    .filter(e => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return (e.perfil_nombre || "").toLowerCase().includes(q)
        || (e.perfil_email || "").toLowerCase().includes(q)
        || (e.vacante_titulo || "").toLowerCase().includes(q)
    })

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "—"

  const colorPuntaje = (p) => {
    if (p == null) return "rgba(0,0,0,0.3)"
    if (p >= 85) return "#059669"
    if (p >= 70) return "#0891b2"
    if (p >= 50) return "#d97706"
    return "#b91c1c"
  }

  const colorEstado = (e) => {
    if (e === "completada") return { color: "#059669", bg: "#d1fae5" }
    if (e === "programada") return { color: "#1e40af", bg: "#dbeafe" }
    return { color: "#b91c1c", bg: "#fee2e2" }
  }

  // Calcular puntaje promedio en tiempo real
  const subPuntajes = [form.puntaje_tecnico, form.puntaje_comunicacion, form.puntaje_conocimientos, form.puntaje_actitud]
    .map(p => p !== "" ? Number(p) : null).filter(p => p !== null)
  const puntajePromedio = subPuntajes.length > 0
    ? Math.round(subPuntajes.reduce((s, p) => s + p, 0) / subPuntajes.length)
    : null
  const nivelCalc = puntajePromedio == null ? null
    : puntajePromedio >= 85 ? "Excelente"
    : puntajePromedio >= 70 ? "Bueno"
    : puntajePromedio >= 50 ? "Regular" : "Débil"

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={s.title}>Gestión de Entrevistas</h1>
          <p style={s.subtitle}>{entrevistas.length} entrevistas registradas</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {vista === "lista" && <button onClick={handleNueva} style={s.btnPrimary}>+ Nueva entrevista</button>}
          <button onClick={onVolver} style={s.btnSec}>← Volver</button>
        </div>
      </div>

      {error && <div style={s.error} role="alert">{error}</div>}
      {mensaje && <div style={s.success}>{mensaje}</div>}

      {/* LISTA */}
      {vista === "lista" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
            <input
              placeholder="Buscar por candidato o vacante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1 }}
            />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: 180 }}>
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: 60, color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <p>No hay entrevistas</p>
              <button onClick={handleNueva} style={{ ...s.btnPrimary, marginTop: 16 }}>Crear la primera</button>
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }}>
              {filtradas.map((ent, i) => {
                const est = colorEstado(ent.estado)
                return (
                  <div key={ent.id} style={{ ...s.row, borderBottom: i < filtradas.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                    <div style={{ flex: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{ent.perfil_nombre || "—"}</div>
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{ent.perfil_email}</div>
                    </div>
                    <div style={{ flex: 1.5, fontSize: 13, color: "rgba(0,0,0,0.7)" }}>
                      {ent.vacante_titulo ? (
                        <div>
                          <div>{ent.vacante_titulo}</div>
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>{ent.vacante_empresa}</div>
                        </div>
                      ) : "—"}
                    </div>
                    <div style={{ flex: 1, fontSize: 12 }}>
                      <span style={s.meta}>{TIPOS.find(t => t.value === ent.tipo)?.label}</span>
                    </div>
                    <div style={{ flex: 1.2, fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                      {fmtFecha(ent.fecha_entrevista)}
                    </div>
                    <div style={{ flex: 0.6 }}>
                      <span style={{ ...s.estadoChip, color: est.color, background: est.bg }}>
                        {ESTADOS.find(e => e.value === ent.estado)?.label}
                      </span>
                    </div>
                    <div style={{ flex: 0.5, fontWeight: 600, color: colorPuntaje(ent.puntaje), fontSize: 18 }}>
                      {ent.puntaje != null ? ent.puntaje : "—"}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEditar(ent)} style={s.btnMini}>Editar</button>
                      <button onClick={() => handleEliminar(ent.id, ent.perfil_nombre)} style={s.btnMiniDanger}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO */}
      {vista === "form" && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h3 style={{ fontSize: 20, marginBottom: 24 }}>
            {editandoId ? "Editar entrevista" : "Nueva entrevista"}
          </h3>

          <Section title="Información básica">
            <div style={s.grid2}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Candidato *</label>
                <select name="perfil_id" value={form.perfil_id} onChange={handleChange} required>
                  <option value="">Seleccionar candidato...</option>
                  {perfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo} ({p.email})</option>
                  ))}
                </select>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Vacante</label>
                <select name="vacante_id" value={form.vacante_id} onChange={handleChange}>
                  <option value="">Sin asociar a vacante</option>
                  {vacantes.map(v => (
                    <option key={v.id} value={v.id}>{v.titulo} — {v.empresa}</option>
                  ))}
                </select>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Fecha y hora</label>
                <input type="datetime-local" name="fecha_entrevista" value={form.fecha_entrevista} onChange={handleChange} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <Field label="Entrevistador" name="entrevistador" value={form.entrevistador} onChange={handleChange} placeholder="Nombre del entrevistador" />
              <Field label="Duración (minutos)" name="duracion_minutos" type="number" value={form.duracion_minutos} onChange={handleChange} placeholder="Ej: 60" />
            </div>
          </Section>

          <Section title="Estado">
            <div style={s.fieldWrap}>
              <label style={s.label}>Estado actual</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Evaluación por categorías">
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", marginBottom: 16 }}>
              Asigna un puntaje de 0 a 100 a cada categoría. El puntaje total se calcula automáticamente como promedio.
            </p>

            <ScoreSlider
              label="Habilidades técnicas"
              name="puntaje_tecnico"
              value={form.puntaje_tecnico}
              onChange={handleChange}
            />
            <ScoreSlider
              label="Comunicación"
              name="puntaje_comunicacion"
              value={form.puntaje_comunicacion}
              onChange={handleChange}
            />
            <ScoreSlider
              label="Conocimientos del área"
              name="puntaje_conocimientos"
              value={form.puntaje_conocimientos}
              onChange={handleChange}
            />
            <ScoreSlider
              label="Actitud y motivación"
              name="puntaje_actitud"
              value={form.puntaje_actitud}
              onChange={handleChange}
            />

            {puntajePromedio != null && (
              <div style={{ marginTop: 20, padding: 16, background: "#fafafa", border: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }}>Puntaje total calculado</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 600, color: colorPuntaje(puntajePromedio) }}>
                      {puntajePromedio}/100
                    </div>
                    <div style={{ fontSize: 12, color: colorPuntaje(puntajePromedio), fontWeight: 500 }}>
                      Nivel: {nivelCalc}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          <Section title="Feedback al candidato">
            <div style={s.fieldWrap}>
              <label style={s.label}>Fortalezas</label>
              <textarea name="fortalezas" value={form.fortalezas} onChange={handleChange} rows={2}
                placeholder="Lo que el candidato hizo bien" style={{ resize: "vertical" }} />
            </div>
            <div style={{ ...s.fieldWrap, marginTop: 12 }}>
              <label style={s.label}>Áreas de mejora</label>
              <textarea name="debilidades" value={form.debilidades} onChange={handleChange} rows={2}
                placeholder="Qué puede mejorar" style={{ resize: "vertical" }} />
            </div>
            <div style={{ ...s.fieldWrap, marginTop: 12 }}>
              <label style={s.label}>Recomendaciones</label>
              <textarea name="recomendaciones" value={form.recomendaciones} onChange={handleChange} rows={2}
                placeholder="Sugerencias para próximas entrevistas" style={{ resize: "vertical" }} />
            </div>
          </Section>

          <Section title="Notas internas (no visibles para el candidato)">
            <div style={s.fieldWrap}>
              <textarea name="notas_admin" value={form.notas_admin} onChange={handleChange} rows={2}
                placeholder="Notas privadas del equipo de RH" style={{ resize: "vertical" }} />
            </div>
          </Section>

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setVista("lista"); setError(""); setMensaje("") }} style={s.btnSec}>
              Cancelar
            </button>
            <button type="submit" style={s.btnPrimary}>
              {editandoId ? "Guardar cambios" : "Crear entrevista"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function ScoreSlider({ label, name, value, onChange }) {
  const numValue = value !== "" ? Number(value) : 0
  const colorBar = numValue >= 85 ? "#059669"
    : numValue >= 70 ? "#0891b2"
    : numValue >= 50 ? "#d97706" : "#b91c1c"

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: "rgba(0,0,0,0.7)" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 500, color: value !== "" ? colorBar : "rgba(0,0,0,0.3)" }}>
          {value !== "" ? `${value}/100` : "Sin puntaje"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="range" min="0" max="100"
          name={name} value={value !== "" ? value : 0}
          onChange={onChange}
          style={{ flex: 1, accentColor: colorBar }}
        />
        <input
          type="number" min="0" max="100"
          name={name} value={value} onChange={onChange}
          placeholder="—" style={{ width: 70, textAlign: "center" }}
        />
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 14, color: "#1a1a1a", marginBottom: 14, fontWeight: 500, paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

const s = {
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em", color: "#1a1a1a" },
  subtitle: { fontSize: 14, color: "rgba(0,0,0,0.55)" },
  error: { color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)", background: "#fef2f2", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  success: { color: "#059669", border: "1px solid rgba(5,150,105,0.2)", background: "#d1fae5", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  row: { display: "flex", alignItems: "center", padding: "14px 16px", gap: 12 },
  meta: { fontSize: 11, padding: "2px 8px", border: "1px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" },
  estadoChip: { fontSize: 11, padding: "2px 8px", fontWeight: 500 },
  btnPrimary: { padding: "12px 24px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 14, cursor: "pointer" },
  btnSec: { padding: "10px 20px", background: "#fff", color: "#1a1a1a", border: "1px solid rgba(0,0,0,0.15)", fontSize: 13, cursor: "pointer" },
  btnMini: { fontSize: 12, padding: "4px 10px", background: "#fff", color: "rgba(0,0,0,0.7)", border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer" },
  btnMiniDanger: { fontSize: 12, padding: "4px 10px", background: "#fff", color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)", cursor: "pointer" },
  formCard: { border: "1px solid rgba(0,0,0,0.1)", padding: 32, background: "#fff" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 },
  label: { fontSize: 13, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" },
}