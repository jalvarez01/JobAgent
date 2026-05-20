import { useState, useEffect } from "react"
import {
  listarTodasEntrevistas, crearEntrevista,
  actualizarEntrevista, eliminarEntrevista,
} from "../api/entrevistas"
import { listarPerfilesAdmin } from "../api/perfil"
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
        listarTodasEntrevistas(), listarPerfilesAdmin(), listarTodasVacantes(),
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
    if (p == null) return "var(--muted-foreground)"
    if (p >= 85) return "var(--success)"
    if (p >= 70) return "var(--info)"
    if (p >= 50) return "var(--warning)"
    return "var(--destructive)"
  }

  const colorEstado = (e) => {
    if (e === "completada") return { color: "var(--success)", bg: "var(--success-bg)" }
    if (e === "programada") return { color: "var(--info)", bg: "var(--info-bg)" }
    return { color: "var(--destructive)", bg: "var(--destructive-bg)" }
  }

  // Cálculo en tiempo real
  const subPuntajes = [form.puntaje_tecnico, form.puntaje_comunicacion, form.puntaje_conocimientos, form.puntaje_actitud]
    .map(p => p !== "" ? Number(p) : null).filter(p => p !== null)
  const puntajePromedio = subPuntajes.length > 0
    ? Math.round(subPuntajes.reduce((sum, p) => sum + p, 0) / subPuntajes.length)
    : null
  const nivelCalc = puntajePromedio == null ? null
    : puntajePromedio >= 85 ? "Excelente"
    : puntajePromedio >= 70 ? "Bueno"
    : puntajePromedio >= 50 ? "Regular" : "Débil"

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Gestión de Entrevistas</h1>
          <p style={s.subtitle}>{entrevistas.length} entrevistas registradas</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {vista === "lista" && (
            <button
              onClick={handleNueva}
              style={s.btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              + Nueva entrevista
            </button>
          )}
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
      </div>

      {error && <div style={s.error} role="alert">{error}</div>}
      {mensaje && <div style={s.success}>{mensaje}</div>}

      {/* LISTA */}
      {vista === "lista" && (
        <div className="animate-slide-up">
          <div style={s.filtersRow}>
            <input
              placeholder="Buscar por candidato o vacante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={s.loading}><div style={s.spinner} /></div>
          ) : filtradas.length === 0 ? (
            <div style={s.empty}>
              <h3 style={s.emptyTitle}>No hay entrevistas</h3>
              <button
                onClick={handleNueva}
                style={{ ...s.btnPrimary, marginTop: 20 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
              >
                Crear la primera
              </button>
            </div>
          ) : (
            <div style={s.tableCard}>
              {filtradas.map((ent, i) => {
                const est = colorEstado(ent.estado)
                return (
                  <div
                    key={ent.id}
                    style={{
                      ...s.row,
                      borderBottom: i < filtradas.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ flex: 2, minWidth: 0 }}>
                      <div style={s.rowTitle}>{ent.perfil_nombre || "—"}</div>
                      <div style={s.rowSub}>{ent.perfil_email}</div>
                    </div>
                    <div style={{ flex: 1.5, fontSize: 13, color: "var(--muted-foreground)" }}>
                      {ent.vacante_titulo ? (
                        <div>
                          <div style={{ color: "var(--foreground)", fontSize: 13 }}>{ent.vacante_titulo}</div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>{ent.vacante_empresa}</div>
                        </div>
                      ) : "—"}
                    </div>
                    <div style={{ flex: 0.8 }}>
                      <span style={s.tipoChip}>
                        {TIPOS.find(t => t.value === ent.tipo)?.label}
                      </span>
                    </div>
                    <div style={{ flex: 1.2, fontSize: 12, color: "var(--muted-foreground)" }}>
                      {fmtFecha(ent.fecha_entrevista)}
                    </div>
                    <div style={{ flex: 0.7 }}>
                      <span style={{ ...s.estadoChip, color: est.color, background: est.bg }}>
                        {ESTADOS.find(e => e.value === ent.estado)?.label}
                      </span>
                    </div>
                    <div style={{ flex: 0.5, textAlign: "center" }}>
                      <span style={{ ...s.puntajeBig, color: colorPuntaje(ent.puntaje) }}>
                        {ent.puntaje != null ? ent.puntaje : "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleEditar(ent)}
                        style={s.btnMini}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(ent.id, ent.perfil_nombre)}
                        style={s.btnMiniDanger}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--destructive-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        ×
                      </button>
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
        <form onSubmit={handleSubmit} style={s.formCard} className="animate-slide-up">
          <h3 style={s.formTitle}>
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
            <div style={{ ...s.fieldWrap, maxWidth: 280 }}>
              <label style={s.label}>Estado actual</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Evaluación por categorías">
            <p style={s.helpText}>
              Asigna un puntaje de 0 a 100 a cada categoría. El puntaje total se calcula automáticamente como promedio.
            </p>

            <ScoreSlider label="Habilidades técnicas" name="puntaje_tecnico" value={form.puntaje_tecnico} onChange={handleChange} />
            <ScoreSlider label="Comunicación" name="puntaje_comunicacion" value={form.puntaje_comunicacion} onChange={handleChange} />
            <ScoreSlider label="Conocimientos del área" name="puntaje_conocimientos" value={form.puntaje_conocimientos} onChange={handleChange} />
            <ScoreSlider label="Actitud y motivación" name="puntaje_actitud" value={form.puntaje_actitud} onChange={handleChange} />

            {puntajePromedio != null && (
              <div style={s.totalScoreCard}>
                <div>
                  <span style={s.totalScoreLabel}>Puntaje total calculado</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...s.totalScoreValue, color: colorPuntaje(puntajePromedio) }}>
                    {puntajePromedio}<span style={s.totalScoreMax}>/100</span>
                  </div>
                  <div style={{ ...s.totalScoreNivel, color: colorPuntaje(puntajePromedio) }}>
                    Nivel: {nivelCalc}
                  </div>
                </div>
              </div>
            )}
          </Section>

          <Section title="Feedback al candidato">
            <div style={s.fieldWrap}>
              <label style={s.label}>Fortalezas</label>
              <textarea
                name="fortalezas" value={form.fortalezas} onChange={handleChange}
                rows={2} placeholder="Lo que el candidato hizo bien"
              />
            </div>
            <div style={{ ...s.fieldWrap, marginTop: 14 }}>
              <label style={s.label}>Áreas de mejora</label>
              <textarea
                name="debilidades" value={form.debilidades} onChange={handleChange}
                rows={2} placeholder="Qué puede mejorar"
              />
            </div>
            <div style={{ ...s.fieldWrap, marginTop: 14 }}>
              <label style={s.label}>Recomendaciones</label>
              <textarea
                name="recomendaciones" value={form.recomendaciones} onChange={handleChange}
                rows={2} placeholder="Sugerencias para próximas entrevistas"
              />
            </div>
          </Section>

          <Section title="Notas internas">
            <p style={s.helpText}>Solo visibles para el equipo de RH, nunca para el candidato.</p>
            <div style={s.fieldWrap}>
              <textarea
                name="notas_admin" value={form.notas_admin} onChange={handleChange}
                rows={2} placeholder="Notas privadas del equipo"
              />
            </div>
          </Section>

          <div style={s.actions}>
            <button
              type="button"
              onClick={() => { setVista("lista"); setError(""); setMensaje("") }}
              style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={s.btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
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
  const color = numValue >= 85 ? "var(--success)"
    : numValue >= 70 ? "var(--info)"
    : numValue >= 50 ? "var(--warning)" : "var(--destructive)"

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={s.sliderHeader}>
        <label style={s.sliderLabel}>{label}</label>
        <span style={{
          ...s.sliderValue,
          color: value !== "" ? color : "var(--muted-foreground)",
        }}>
          {value !== "" ? `${value}/100` : "Sin puntaje"}
        </span>
      </div>
      <div style={s.sliderRow}>
        <input
          type="range" min="0" max="100"
          name={name} value={value !== "" ? value : 0}
          onChange={onChange}
          style={{ ...s.rangeInput, accentColor: color }}
        />
        <input
          type="number" min="0" max="100"
          name={name} value={value} onChange={onChange}
          placeholder="—" style={{ width: 80, textAlign: "center" }}
        />
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h4 style={s.sectionTitle}>{title}</h4>
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
  container: {
    maxWidth: 1180,
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
    fontSize: 48,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 15,
    color: "var(--muted-foreground)",
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
  success: {
    color: "#1d7d3f",
    background: "var(--success-bg)",
    border: "1px solid rgba(52, 199, 89, 0.25)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  filtersRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    alignItems: "center",
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
  emptyTitle: {
    fontSize: 19,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  tableCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "14px 18px",
    gap: 12,
    transition: "background 0.15s",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
    letterSpacing: "-0.005em",
  },
  rowSub: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  tipoChip: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    padding: "3px 10px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
  },
  estadoChip: {
    fontSize: 11,
    padding: "3px 10px",
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
  },
  puntajeBig: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "-0.02em",
  },
  btnMini: {
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 14px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnMiniDanger: {
    fontSize: 16,
    padding: "4px 10px",
    background: "transparent",
    color: "var(--destructive)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-full)",
    cursor: "pointer",
    transition: "background 0.2s",
    lineHeight: 1,
  },
  // Form
  formCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 32,
    boxShadow: "var(--shadow-sm)",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 28,
    color: "var(--foreground)",
  },
  section: {
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: "1px solid var(--border)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 16,
    letterSpacing: "-0.005em",
  },
  helpText: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginBottom: 16,
    lineHeight: 1.4,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--foreground)",
    paddingLeft: 4,
  },
  // Slider
  sliderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "var(--foreground)",
    fontWeight: 500,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  sliderRow: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  rangeInput: {
    flex: 1,
    cursor: "pointer",
  },
  totalScoreCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    padding: "20px 24px",
    background: "rgba(0,0,0,0.025)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  },
  totalScoreLabel: {
    fontSize: 14,
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },
  totalScoreValue: {
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  totalScoreMax: {
    fontSize: 18,
    color: "var(--muted-foreground)",
    fontWeight: 400,
  },
  totalScoreNivel: {
    fontSize: 13,
    fontWeight: 500,
    marginTop: 4,
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 8,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "11px 22px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
}