import { useState } from "react"
import { actualizarPerfil } from "../api/perfil"

const NIVELES = [
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
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (skill && !form.skills.includes(skill)) {
      setForm((f) => ({ ...f, skills: [...f.skills, skill] }))
    }
    setSkillInput("")
  }

  const handleRemoveSkill = (sk) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== sk) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess(false)

    if (!form.nombre_completo.trim()) return setError("El nombre es obligatorio")
    if (!form.email.includes("@")) return setError("Email inválido")

    setLoading(true)
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
      const actualizado = await actualizarPerfil(perfil.id, payload)
      setSuccess(true)
      setTimeout(() => {
        if (onPerfilActualizado) onPerfilActualizado(actualizado)
      }, 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.hero} className="animate-fade-in">
        <h1 style={s.title}>Editar perfil</h1>
        <p style={s.subtitle}>Actualiza tu información profesional</p>
      </div>

      {error && <div style={s.error} role="alert">{error}</div>}
      {success && <div style={s.success}>Perfil actualizado correctamente</div>}

      <form onSubmit={handleSubmit} className="animate-slide-up">
        <Section title="Datos personales">
          <div style={s.grid2}>
            <Field label="Nombre completo *" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required />
            <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            <Field label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín, Antioquia" />
          </div>
        </Section>

        <Section title="Educación">
          <div style={s.grid2}>
            <SelectField label="Nivel educativo" name="nivel_educativo" value={form.nivel_educativo} onChange={handleChange} options={NIVELES} />
            <Field label="Título" name="titulo_educativo" value={form.titulo_educativo} onChange={handleChange} />
            <Field label="Institución" name="institucion_educativa" value={form.institucion_educativa} onChange={handleChange} />
          </div>
        </Section>

        <Section title="Experiencia">
          <div style={s.grid2}>
            <Field label="Años de experiencia" name="experiencia_anos" type="number" value={form.experiencia_anos} onChange={handleChange} />
            <Field label="Cargo actual" name="cargo_actual" value={form.cargo_actual} onChange={handleChange} />
            <Field label="Empresa actual" name="empresa_actual" value={form.empresa_actual} onChange={handleChange} />
          </div>
          <div style={{ ...s.fieldWrap, marginTop: 14 }}>
            <label style={s.label}>Resumen profesional</label>
            <textarea
              name="resumen_profesional"
              value={form.resumen_profesional}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descripción de tu trayectoria profesional"
            />
          </div>
        </Section>

        <Section title="Habilidades">
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              placeholder="Escribe una habilidad y presiona Enter"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Agregar
            </button>
          </div>
          <div style={s.tags}>
            {form.skills.map((sk) => (
              <span key={sk} style={s.tag}>
                {sk}
                <span
                  onClick={() => handleRemoveSkill(sk)}
                  style={s.tagX}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                >
                  ×
                </span>
              </span>
            ))}
            {form.skills.length === 0 && <span style={s.muted}>Sin habilidades agregadas</span>}
          </div>
        </Section>

        <Section title="Preferencias laborales">
          <div style={s.grid2}>
            <Field label="Salario mínimo (COP)" name="aspiracion_salarial_min" type="number" value={form.aspiracion_salarial_min} onChange={handleChange} />
            <Field label="Salario máximo (COP)" name="aspiracion_salarial_max" type="number" value={form.aspiracion_salarial_max} onChange={handleChange} />
            <SelectField label="Modalidad" name="modalidad_preferida" value={form.modalidad_preferida} onChange={handleChange} options={MODALIDADES} />
            <SelectField label="Disponibilidad" name="disponibilidad" value={form.disponibilidad} onChange={handleChange} options={DISPONIBILIDADES} />
          </div>
        </Section>

        <div style={s.actions}>
          <button
            type="button"
            onClick={onCancelar}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.card}>
      <h3 style={s.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, name, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
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
    maxWidth: 820,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
  hero: {
    marginBottom: 32,
    textAlign: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 10,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
  },
  card: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 18,
    color: "var(--foreground)",
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
    letterSpacing: "0.01em",
    paddingLeft: 4,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    background: "var(--accent)",
    color: "var(--accent-foreground)",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
  },
  tagX: {
    cursor: "pointer",
    opacity: 0.5,
    fontSize: 16,
    lineHeight: 1,
    transition: "opacity 0.2s",
  },
  muted: {
    color: "var(--muted-foreground)",
    fontSize: 14,
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
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 24,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "13px 28px",
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
    padding: "13px 24px",
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