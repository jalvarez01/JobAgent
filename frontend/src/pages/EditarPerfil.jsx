import { useState } from "react"
import { actualizarPerfil } from "../api/perfil"

const NIVELES_EDUCATIVOS = [
  { value: "", label: "Seleccionar..." },
  { value: "bachiller", label: "Bachiller" },
  { value: "tecnico", label: "Técnico" },
  { value: "tecnologo", label: "Tecnólogo" },
  { value: "profesional", label: "Profesional" },
  { value: "especialista", label: "Especialista" },
  { value: "maestria", label: "Maestría" },
  { value: "doctorado", label: "Doctorado" },
]

const MODALIDADES = [
  { value: "", label: "Seleccionar..." },
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
]

const DISPONIBILIDADES = [
  { value: "", label: "Seleccionar..." },
  { value: "inmediata", label: "Inmediata" },
  { value: "15_dias", label: "15 días" },
  { value: "1_mes", label: "1 mes" },
  { value: "negociable", label: "Negociable" },
]

export default function EditarPerfil({ perfil, onPerfilActualizado, onCancelar }) {
  const [form, setForm] = useState({
    nombre_completo: perfil.nombre_completo || "",
    email: perfil.email || "",
    telefono: perfil.telefono || "",
    ubicacion: perfil.ubicacion || "",
    resumen_profesional: perfil.resumen_profesional || "",
    nivel_educativo: perfil.nivel_educativo || "",
    titulo_educativo: perfil.titulo_educativo || "",
    institucion_educativa: perfil.institucion_educativa || "",
    experiencia_anos: perfil.experiencia_anos ?? "",
    cargo_actual: perfil.cargo_actual || "",
    empresa_actual: perfil.empresa_actual || "",
    skills: perfil.skills || [],
    aspiracion_salarial_min: perfil.aspiracion_salarial_min ?? "",
    aspiracion_salarial_max: perfil.aspiracion_salarial_max ?? "",
    modalidad_preferida: perfil.modalidad_preferida || "",
    disponibilidad: perfil.disponibilidad || "",
  })
  const [skillInput, setSkillInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [guardado, setGuardado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setGuardado(false)
  }

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (skill && !form.skills.includes(skill)) {
      setForm((f) => ({ ...f, skills: [...f.skills, skill] }))
    }
    setSkillInput("")
    setGuardado(false)
  }

  const handleRemoveSkill = (skill) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))
    setGuardado(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const payload = {
        ...form,
        experiencia_anos: form.experiencia_anos !== "" ? Number(form.experiencia_anos) : null,
        aspiracion_salarial_min: form.aspiracion_salarial_min !== "" ? Number(form.aspiracion_salarial_min) : null,
        aspiracion_salarial_max: form.aspiracion_salarial_max !== "" ? Number(form.aspiracion_salarial_max) : null,
        nivel_educativo: form.nivel_educativo || null,
        modalidad_preferida: form.modalidad_preferida || null,
        disponibilidad: form.disponibilidad || null,
      }
      const updated = await actualizarPerfil(perfil.id, payload)
      setGuardado(true)
      if (onPerfilActualizado) onPerfilActualizado(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const camposCompletitud = [
    "nombre_completo", "email", "telefono", "ubicacion", "resumen_profesional",
    "nivel_educativo", "titulo_educativo", "institucion_educativa", "experiencia_anos",
    "cargo_actual", "skills", "aspiracion_salarial_min", "modalidad_preferida", "disponibilidad",
  ]
  const llenos = camposCompletitud.filter((c) => {
    const v = form[c]
    return v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
  }).length
  const completitud = Math.round((llenos / camposCompletitud.length) * 100)

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={s.title}>Editar perfil</h1>
          <p style={s.subtitle}>Modifica tus datos profesionales</p>
        </div>
        <button onClick={onCancelar} style={s.btnSecondary}>&#8592; Cancelar</button>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {guardado && <div style={s.success}>Perfil actualizado correctamente</div>}

      <form onSubmit={handleSubmit}>
        {/* Completitud */}
        <div style={s.progressContainer}>
          <div style={{ ...s.progressBar, width: `${completitud}%` }} />
          <span style={s.progressLabel}>{completitud}%</span>
        </div>

        {/* Datos personales */}
        <Section title="Datos personales">
          <div style={s.grid2}>
            <Field label="Nombre completo *" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required />
            <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            <Field label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín, Antioquia" />
          </div>
        </Section>

        {/* Educación */}
        <Section title="Educación">
          <div style={s.grid2}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Nivel educativo</label>
              <select name="nivel_educativo" value={form.nivel_educativo} onChange={handleChange}>
                {NIVELES_EDUCATIVOS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <Field label="Título" name="titulo_educativo" value={form.titulo_educativo} onChange={handleChange} />
            <Field label="Institución" name="institucion_educativa" value={form.institucion_educativa} onChange={handleChange} />
          </div>
        </Section>

        {/* Experiencia */}
        <Section title="Experiencia">
          <div style={s.grid2}>
            <Field label="Años de experiencia" name="experiencia_anos" type="number" value={form.experiencia_anos} onChange={handleChange} />
            <Field label="Cargo actual" name="cargo_actual" value={form.cargo_actual} onChange={handleChange} />
            <Field label="Empresa actual" name="empresa_actual" value={form.empresa_actual} onChange={handleChange} />
          </div>
          <div style={{ ...s.fieldWrap, marginTop: 12 }}>
            <label style={s.label}>Resumen profesional</label>
            <textarea name="resumen_profesional" value={form.resumen_profesional} onChange={handleChange} rows={3} style={{ resize: "vertical" }} />
          </div>
        </Section>

        {/* Skills */}
        <Section title="Habilidades">
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              placeholder="Escribe un skill y presiona Enter"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleAddSkill} style={s.btnSecondary}>Agregar</button>
          </div>
          <div style={s.tags}>
            {form.skills.map((sk) => (
              <span key={sk} style={s.tag}>
                {sk}
                <span onClick={() => handleRemoveSkill(sk)} style={s.tagX}>&#10005;</span>
              </span>
            ))}
            {form.skills.length === 0 && <span style={s.muted}>Sin skills agregados</span>}
          </div>
        </Section>

        {/* Preferencias */}
        <Section title="Preferencias laborales">
          <div style={s.grid2}>
            <Field label="Salario mínimo (COP)" name="aspiracion_salarial_min" type="number" value={form.aspiracion_salarial_min} onChange={handleChange} />
            <Field label="Salario máximo (COP)" name="aspiracion_salarial_max" type="number" value={form.aspiracion_salarial_max} onChange={handleChange} />
            <div style={s.fieldWrap}>
              <label style={s.label}>Modalidad</label>
              <select name="modalidad_preferida" value={form.modalidad_preferida} onChange={handleChange}>
                {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Disponibilidad</label>
              <select name="disponibilidad" value={form.disponibilidad} onChange={handleChange}>
                {DISPONIBILIDADES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button type="button" onClick={onCancelar} style={s.btnSecondary}>&#8592; Cancelar</button>
          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, marginBottom: 16, color: "rgba(255,255,255,0.8)" }}>{title}</h3>
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

const s = {
  container: { maxWidth: 720, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 18, color: "rgba(255,255,255,0.5)" },
  error: { color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  success: { color: "rgba(74,222,128,0.9)", border: "1px solid rgba(74,222,128,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  muted: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" },
  progressContainer: { height: 4, background: "rgba(255,255,255,0.1)", marginBottom: 24, position: "relative" },
  progressBar: { height: "100%", background: "#fff", transition: "width 0.3s" },
  progressLabel: { position: "absolute", right: 0, top: -20, fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13 },
  tagX: { cursor: "pointer", opacity: 0.5, fontSize: 11 },
  btnPrimary: { padding: "14px 28px", background: "#fff", color: "#000", border: "none", fontSize: 14, cursor: "pointer" },
  btnSecondary: { padding: "12px 24px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 14, cursor: "pointer" },
}