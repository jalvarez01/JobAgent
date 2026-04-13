import { useState } from "react"
import { uploadCV } from "../api/cv"
import { crearPerfil, analizarCVEstructurado } from "../api/perfil"

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

const INITIAL_FORM = {
  nombre_completo: "", email: "", password: "", confirmPassword: "",
  telefono: "", ubicacion: "",
  resumen_profesional: "", nivel_educativo: "", titulo_educativo: "",
  institucion_educativa: "", experiencia_anos: "", cargo_actual: "",
  empresa_actual: "", skills: [], aspiracion_salarial_min: "",
  aspiracion_salarial_max: "", modalidad_preferida: "", disponibilidad: "",
  cv_texto: "",
}

export default function CrearPerfil({ onPerfilCreado }) {
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [skillInput, setSkillInput] = useState("")
  const [file, setFile] = useState(null)
  const [cvTexto, setCvTexto] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [analisis, setAnalisis] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUploadCV = async () => {
    if (!file) return
    setLoading(true); setError("")
    try {
      const res = await uploadCV(file)
      setCvTexto(res.texto)
      setForm((f) => ({ ...f, cv_texto: res.texto }))
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleAnalizar = async () => {
    if (!cvTexto.trim()) return
    setLoading(true); setError("")
    try {
      const res = await analizarCVEstructurado(cvTexto)
      const data = res.resultado
      setAnalisis(data)
      setForm((f) => ({
        ...f,
        nombre_completo: data.nombre_completo || f.nombre_completo,
        email: data.email || f.email,
        telefono: data.telefono || f.telefono,
        ubicacion: data.ubicacion || f.ubicacion,
        resumen_profesional: data.resumen_profesional || f.resumen_profesional,
        nivel_educativo: data.nivel_educativo || f.nivel_educativo,
        titulo_educativo: data.titulo_educativo || f.titulo_educativo,
        institucion_educativa: data.institucion_educativa || f.institucion_educativa,
        experiencia_anos: data.experiencia_anos ?? f.experiencia_anos,
        cargo_actual: data.cargo_actual || f.cargo_actual,
        empresa_actual: data.empresa_actual || f.empresa_actual,
        skills: data.skills?.length ? data.skills : f.skills,
      }))
      setPaso(2)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

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

  const handleRemoveSkill = (skill) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validación client-side
    if (!form.nombre_completo.trim()) {
      setError("Por favor ingresa tu nombre completo")
      return
    }
    if (!form.email.trim()) {
      setError("Por favor ingresa tu email")
      return
    }
    if (form.email.trim() && !form.email.includes("@")) {
      setError("Por favor ingresa un email válido")
      return
    }
    if (!form.password || form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("La contraseña debe tener al menos una letra mayúscula")
      return
    }
    if (!/[a-z]/.test(form.password)) {
      setError("La contraseña debe tener al menos una letra minúscula")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

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
      delete payload.confirmPassword
      const perfil = await crearPerfil(payload)

      // Guardar sesión
      localStorage.setItem("jobagent_session", JSON.stringify({
        perfil_id: perfil.id,
        email: perfil.email,
        nombre: perfil.nombre_completo,
      }))

      if (onPerfilCreado) onPerfilCreado(perfil)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
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
      {/* Header */}
      <div style={s.hero}>
        <h1 style={s.title}>
          {paso === 1 ? "Sube tu hoja de vida" : "Completa tu perfil"}
        </h1>
        <p style={s.subtitle}>
          {paso === 1
            ? "Sube tu CV y deja que la IA extraiga tus datos automáticamente"
            : "Revisa y ajusta la información extraída"}
        </p>
      </div>

      {/* Steps indicator */}
      <div style={s.steps}>
        <span style={paso === 1 ? s.stepActive : s.stepDone}>1. Subir CV</span>
        <span style={s.stepArrow}>—</span>
        <span style={paso === 2 ? s.stepActive : s.stepInactive}>2. Perfil</span>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* ═══ PASO 1 ═══ */}
      {paso === 1 && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsDragging(false)
              const f = e.dataTransfer.files[0]
              if (f) { setFile(f); setCvTexto("") }
            }}
            style={{
              ...s.dropZone,
              borderColor: isDragging ? "#fff" : file ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
              background: isDragging ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            {!file ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>&#8593;</div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>Arrastra tu CV aquí</h3>
                <p style={s.muted}>o selecciona un archivo PDF / DOCX</p>
                <label style={s.btnPrimary}>
                  Seleccionar archivo
                  <input
                    type="file" accept=".pdf,.docx"
                    onChange={(e) => { setFile(e.target.files[0]); setCvTexto("") }}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            ) : (
              <div style={{ padding: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h4 style={{ fontSize: 18, marginBottom: 4 }}>{file.name}</h4>
                    <p style={s.muted}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span onClick={() => { setFile(null); setCvTexto("") }} style={{ ...s.muted, cursor: "pointer", fontSize: 20 }}>&#10005;</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {!cvTexto && (
                    <button onClick={handleUploadCV} disabled={loading} style={s.btnPrimary}>
                      {loading ? "Subiendo..." : "Subir CV"}
                    </button>
                  )}
                  {cvTexto && (
                    <button onClick={handleAnalizar} disabled={loading} style={s.btnPrimary}>
                      {loading ? "Analizando con IA..." : "Analizar y continuar"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <span onClick={() => setPaso(2)} style={{ ...s.muted, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
              Saltar — llenar manualmente
            </span>
          </div>
        </div>
      )}

      {/* ═══ PASO 2 ═══ */}
      {paso === 2 && (
        <form onSubmit={handleSubmit}>
          {/* Completitud */}
          <div style={s.progressContainer}>
            <div style={{ ...s.progressBar, width: `${completitud}%` }} />
            <span style={s.progressLabel}>{completitud}%</span>
          </div>

          {analisis && (
            <div style={s.infoBox}>Datos pre-llenados por IA. Revisa y ajusta lo que sea necesario.</div>
          )}

          {/* Datos personales */}
          <Section title="Datos personales">
            <div style={s.grid2}>
              <Field label="Nombre completo *" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required />
              <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
              <Field label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín, Antioquia" />
              <Field label="Contraseña *" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres, mayúscula y minúscula" />
              <Field label="Confirmar contraseña *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" />
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
            <button type="button" onClick={() => setPaso(1)} style={s.btnSecondary}>&#8592; Volver</button>
            <button type="submit" disabled={loading} style={s.btnPrimary}>
              {loading ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </form>
      )}
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
  hero: { marginBottom: 40 },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 18, color: "rgba(255,255,255,0.5)" },
  steps: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, fontSize: 14 },
  stepActive: { color: "#fff", borderBottom: "1px solid #fff", paddingBottom: 2 },
  stepDone: { color: "rgba(255,255,255,0.4)" },
  stepInactive: { color: "rgba(255,255,255,0.3)" },
  stepArrow: { color: "rgba(255,255,255,0.2)" },
  error: { color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)", padding: "10px 14px", marginBottom: 16, fontSize: 14 },
  infoBox: { color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", marginBottom: 20, fontSize: 14 },
  dropZone: { border: "2px dashed", transition: "all 0.3s" },
  muted: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  btnPrimary: {
    display: "inline-block", padding: "14px 28px", background: "#fff", color: "#000",
    border: "none", fontSize: 14, cursor: "pointer", marginTop: 16,
    transition: "opacity 0.2s", letterSpacing: "0.02em",
  },
  btnSecondary: {
    padding: "12px 24px", background: "transparent", color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)", fontSize: 14, cursor: "pointer",
    transition: "border-color 0.2s",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" },
  progressContainer: { height: 4, background: "rgba(255,255,255,0.1)", marginBottom: 24, position: "relative" },
  progressBar: { height: "100%", background: "#fff", transition: "width 0.3s" },
  progressLabel: { position: "absolute", right: 0, top: -20, fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
    border: "1px solid rgba(255,255,255,0.2)", fontSize: 13,
  },
  tagX: { cursor: "pointer", opacity: 0.5, fontSize: 11 },
}