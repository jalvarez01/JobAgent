import { useState, useEffect } from "react"
import {
  listarTodasVacantes, crearVacante, actualizarVacante, eliminarVacante,
} from "../api/vacantes"

const MODALIDADES = [
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
]
const ESTADOS = [
  { value: "activa", label: "Activa" },
  { value: "inactiva", label: "Inactiva" },
  { value: "cerrada", label: "Cerrada" },
]

const FORM_VACIO = {
  titulo: "", empresa: "", ubicacion: "", modalidad: "presencial",
  salario_min: "", salario_max: "", descripcion: "", requisitos: "",
  url: "", estado: "activa",
}

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
    setLoading(true); setError("")
    try {
      const data = await listarTodasVacantes()
      setVacantes(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleNueva = () => {
    setForm({ ...FORM_VACIO }); setEditandoId(null)
    setError(""); setMensaje(""); setVista("form")
  }

  const handleEditar = (v) => {
    setForm({
      titulo: v.titulo, empresa: v.empresa, ubicacion: v.ubicacion || "",
      modalidad: v.modalidad || "presencial",
      salario_min: v.salario_min ?? "", salario_max: v.salario_max ?? "",
      descripcion: v.descripcion || "", requisitos: v.requisitos || "",
      url: v.url || "", estado: v.estado || "activa",
    })
    setEditandoId(v.id); setError(""); setMensaje(""); setVista("form")
  }

  const handleEliminar = async (id, titulo) => {
    if (!confirm(`¿Eliminar la vacante "${titulo}"?`)) return
    try {
      await eliminarVacante(id)
      setMensaje("Vacante eliminada correctamente")
      await cargar()
    } catch (err) { setError(err.message) }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setMensaje("")

    if (!form.titulo.trim()) return setError("El título es obligatorio")
    if (!form.empresa.trim()) return setError("La empresa es obligatoria")

    const payload = {
      ...form,
      salario_min: form.salario_min !== "" ? Number(form.salario_min) : null,
      salario_max: form.salario_max !== "" ? Number(form.salario_max) : null,
    }

    try {
      if (editandoId) {
        await actualizarVacante(editandoId, payload)
        setMensaje("Vacante actualizada correctamente")
      } else {
        await crearVacante(payload)
        setMensaje("Vacante creada correctamente")
      }
      await cargar(); setVista("lista")
    } catch (err) { setError(err.message) }
  }

  const filtradas = vacantes.filter(v => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return v.titulo.toLowerCase().includes(q)
      || v.empresa.toLowerCase().includes(q)
      || (v.ubicacion || "").toLowerCase().includes(q)
  })

  const skillsPreview = form.requisitos
    ? form.requisitos.split(";").map(s => s.trim()).filter(Boolean)
    : []

  const colorEstado = (e) => {
    if (e === "activa") return { color: "var(--success)", bg: "var(--success-bg)" }
    if (e === "inactiva") return { color: "var(--warning)", bg: "var(--warning-bg)" }
    return { color: "var(--destructive)", bg: "var(--destructive-bg)" }
  }

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <h1 style={s.title}>Gestión de Vacantes</h1>
          <p style={s.subtitle}>{vacantes.length} vacantes registradas</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {vista === "lista" && (
            <button
              onClick={handleNueva}
              style={s.btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              + Nueva vacante
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
          <div style={s.searchRow}>
            <input
              placeholder="Buscar por título, empresa o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          {loading ? (
            <div style={s.loading}><div style={s.spinner} /></div>
          ) : filtradas.length === 0 ? (
            <div style={s.empty}>
              <h3 style={s.emptyTitle}>
                {busqueda ? "No se encontraron vacantes" : "No hay vacantes registradas"}
              </h3>
              {!busqueda && (
                <button
                  onClick={handleNueva}
                  style={{ ...s.btnPrimary, marginTop: 20 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                >
                  Crear la primera
                </button>
              )}
            </div>
          ) : (
            <div style={s.tableCard}>
              {filtradas.map((v, i) => {
                const est = colorEstado(v.estado)
                return (
                  <div
                    key={v.id}
                    style={{
                      ...s.row,
                      borderBottom: i < filtradas.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ flex: 2, minWidth: 0 }}>
                      <div style={s.rowTitle}>{v.titulo}</div>
                      <div style={s.rowEmpresa}>{v.empresa}</div>
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--muted-foreground)" }}>
                      {v.ubicacion || "—"}
                    </div>
                    <div style={{ flex: 0.8 }}>
                      <span style={s.modalidadChip}>
                        {MODALIDADES.find(m => m.value === v.modalidad)?.label || v.modalidad}
                      </span>
                    </div>
                    <div style={{ flex: 0.7 }}>
                      <span style={{ ...s.estadoChip, color: est.color, background: est.bg }}>
                        {ESTADOS.find(e => e.value === v.estado)?.label || v.estado}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleEditar(v)}
                        style={s.btnMini}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(v.id, v.titulo)}
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
            {editandoId ? "Editar vacante" : "Nueva vacante"}
          </h3>

          <Section title="Información general">
            <div style={s.grid2}>
              <Field label="Título *" name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Desarrollador Backend Senior" />
              <Field label="Empresa *" name="empresa" value={form.empresa} onChange={handleChange} required />
              <Field label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín, Antioquia" />
              <SelectField label="Modalidad" name="modalidad" value={form.modalidad} onChange={handleChange} options={MODALIDADES} />
              <Field label="Salario mínimo (COP)" name="salario_min" type="number" value={form.salario_min} onChange={handleChange} />
              <Field label="Salario máximo (COP)" name="salario_max" type="number" value={form.salario_max} onChange={handleChange} />
              <SelectField label="Estado" name="estado" value={form.estado} onChange={handleChange} options={ESTADOS} />
              <Field label="URL de la oferta" name="url" value={form.url} onChange={handleChange} placeholder="https://..." />
            </div>
          </Section>

          <Section title="Descripción">
            <div style={s.fieldWrap}>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Describe la posición, responsabilidades y beneficios"
              />
            </div>
          </Section>

          <Section title="Requisitos">
            <div style={s.fieldWrap}>
              <label style={s.label}>Habilidades requeridas (separadas por punto y coma)</label>
              <textarea
                name="requisitos"
                value={form.requisitos}
                onChange={handleChange}
                rows={2}
                placeholder="python; sql; docker; aws"
              />
            </div>

            {skillsPreview.length > 0 && (
              <div style={s.skillsPreview}>
                <div style={s.skillsPreviewLabel}>Vista previa</div>
                <div style={s.tags}>
                  {skillsPreview.map((sk, i) => (
                    <span key={i} style={s.tag}>{sk}</span>
                  ))}
                </div>
              </div>
            )}
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
              {editandoId ? "Guardar cambios" : "Crear vacante"}
            </button>
          </div>
        </form>
      )}
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

function Field({ label, name, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 1100,
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
  searchRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
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
    padding: "16px 20px",
    gap: 14,
    transition: "background 0.15s",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
    letterSpacing: "-0.005em",
  },
  rowEmpresa: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  modalidadChip: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    padding: "3px 10px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
  },
  estadoChip: {
    fontSize: 11,
    padding: "3px 10px",
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
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
  skillsPreview: {
    marginTop: 14,
    padding: 14,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  skillsPreviewLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 8,
    fontWeight: 500,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontSize: 12,
    color: "var(--accent-foreground)",
    background: "var(--accent)",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    fontWeight: 500,
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