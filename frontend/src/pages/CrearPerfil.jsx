import { useState } from "react"
import { uploadCV } from "../api/cv"
import { crearPerfil, analizarCVEstructurado } from "../api/perfil"

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

const INITIAL = {
  nombre_completo: "", email: "", password: "", confirmPassword: "",
  telefono: "", ubicacion: "", resumen_profesional: "", nivel_educativo: "",
  titulo_educativo: "", institucion_educativa: "", experiencia_anos: "",
  cargo_actual: "", empresa_actual: "", skills: [],
  aspiracion_salarial_min: "", aspiracion_salarial_max: "",
  modalidad_preferida: "", disponibilidad: "", cv_texto: "",
}

export default function CrearPerfil({ onPerfilCreado }) {
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({ ...INITIAL })
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

  const handleRemoveSkill = (sk) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== sk) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.nombre_completo.trim()) return setError("Por favor ingresa tu nombre completo")
    if (!form.email.trim()) return setError("Por favor ingresa tu email")
    if (!form.email.includes("@")) return setError("Por favor ingresa un email válido")
    if (!form.password || form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres")
    if (!/[A-Z]/.test(form.password)) return setError("La contraseña debe tener al menos una letra mayúscula")
    if (!/[a-z]/.test(form.password)) return setError("La contraseña debe tener al menos una letra minúscula")
    if (form.password !== form.confirmPassword) return setError("Las contraseñas no coinciden")

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
      localStorage.setItem("jobagent_session", JSON.stringify({
        perfil_id: perfil.id,
        email: perfil.email,
        nombre: perfil.nombre_completo,
        access_token: perfil.access_token,
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
      <div style={s.hero} className="animate-fade-in">
        <h1 style={s.title}>
          {paso === 1 ? "Crea tu perfil" : "Completa tu información"}
        </h1>
        <p style={s.subtitle}>
          {paso === 1
            ? "Sube tu hoja de vida y deja que la IA extraiga tus datos automáticamente"
            : "Revisa y ajusta la información extraída de tu CV"}
        </p>
      </div>

      {/* Stepper */}
      <div style={s.stepper}>
        <Step number={1} label="Subir CV" active={paso === 1} done={paso > 1} />
        <div style={s.stepLine} />
        <Step number={2} label="Perfil" active={paso === 2} done={false} />
      </div>

      {error && <div style={s.error} role="alert">{error}</div>}

      {paso === 1 && (
        <div className="animate-slide-up">
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
              borderColor: isDragging ? "var(--primary)" : file ? "var(--border-strong)" : "var(--border)",
              background: isDragging ? "var(--accent)" : "var(--card)",
            }}
          >
            {!file ? (
              <div style={s.dropEmpty}>
                <div style={s.uploadIcon}>↑</div>
                <h3 style={s.dropTitle}>Arrastra tu CV aquí</h3>
                <p style={s.dropDesc}>o selecciona un archivo PDF / DOCX</p>
                <label
                  style={s.btnPrimary}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => { setFile(e.target.files[0]); setCvTexto("") }}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            ) : (
              <div style={s.fileBox}>
                <div style={s.fileInfo}>
                  <div style={s.fileIcon}>
                    {file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={s.fileName}>{file.name}</h4>
                    <p style={s.fileMeta}>
                      {(file.size / 1024).toFixed(1)} KB
                      {cvTexto && <span style={s.fileSuccess}> · Subido correctamente</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setCvTexto("") }}
                    style={s.removeBtn}
                    aria-label="Quitar archivo"
                  >
                    ×
                  </button>
                </div>
                <div style={s.fileActions}>
                  {!cvTexto ? (
                    <button
                      onClick={handleUploadCV}
                      disabled={loading}
                      style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                    >
                      {loading ? "Subiendo..." : "Subir CV"}
                    </button>
                  ) : (
                    <button
                      onClick={handleAnalizar}
                      disabled={loading}
                      style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                    >
                      {loading ? "Analizando con IA..." : "Analizar y continuar"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={s.skipWrap}>
            <span
              onClick={() => setPaso(2)}
              style={s.skipLink}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
              Saltar — llenar manualmente
            </span>
          </div>
        </div>
      )}

      {paso === 2 && (
        <form onSubmit={handleSubmit} className="animate-slide-up">
          {/* Barra de completitud */}
          <div style={s.completitudCard}>
            <div style={s.completitudHeader}>
              <span style={s.completitudLabel}>Completitud del perfil</span>
              <span style={s.completitudValue}>{completitud}%</span>
            </div>
            <div style={s.progressContainer}>
              <div style={{ ...s.progressBar, width: `${completitud}%` }} />
            </div>
          </div>

          {analisis && (
            <div style={s.infoBox}>
              <strong>Datos pre-llenados por IA</strong> · Revisa y ajusta lo necesario antes de guardar.
            </div>
          )}

          <Section title="Datos personales">
            <div style={s.grid2}>
              <Field label="Nombre completo *" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required />
              <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
              <Field label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Medellín, Antioquia" />
              <Field label="Contraseña *" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín 8 caracteres" />
              <Field label="Confirmar contraseña *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" />
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
                placeholder="Breve descripción de tu trayectoria"
              />
            </div>
          </Section>

          <Section title="Habilidades">
            <div style={s.skillsInput}>
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
              onClick={() => setPaso(1)}
              style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              {loading ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function Step({ number, label, active, done }) {
  return (
    <div style={s.stepWrap}>
      <div style={{
        ...s.stepCircle,
        background: done ? "var(--success)" : active ? "var(--primary)" : "rgba(0,0,0,0.08)",
        color: (done || active) ? "#fff" : "var(--muted-foreground)",
      }}>
        {done ? "✓" : number}
      </div>
      <span style={{
        ...s.stepLabel,
        color: active ? "var(--foreground)" : "var(--muted-foreground)",
        fontWeight: active ? 500 : 400,
      }}>
        {label}
      </span>
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
    maxWidth: 760,
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
    marginBottom: 12,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    maxWidth: 560,
    margin: "0 auto",
  },
  // Stepper
  stepper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  stepWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
  stepLabel: {
    fontSize: 14,
    transition: "color 0.2s ease",
  },
  stepLine: {
    width: 40,
    height: 1,
    background: "var(--border-strong)",
  },
  // Errores
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  infoBox: {
    color: "var(--primary)",
    background: "var(--accent)",
    border: "1px solid rgba(0, 113, 227, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  // Dropzone
  dropZone: {
    border: "2px dashed",
    borderRadius: "var(--radius-lg)",
    transition: "all 0.3s ease",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  dropEmpty: {
    textAlign: "center",
    padding: "72px 24px",
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 300,
    margin: "0 auto 20px",
  },
  dropTitle: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 8,
    color: "var(--foreground)",
  },
  dropDesc: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    marginBottom: 24,
  },
  fileBox: {
    padding: 32,
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: "var(--radius-md)",
    background: "var(--accent)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  fileName: {
    fontSize: 17,
    fontWeight: 500,
    marginBottom: 4,
    color: "var(--foreground)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  fileSuccess: {
    color: "var(--success)",
    fontWeight: 500,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.04)",
    border: "none",
    fontSize: 18,
    color: "var(--muted-foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  fileActions: {
    display: "flex",
    justifyContent: "center",
  },
  skipWrap: {
    textAlign: "center",
    marginTop: 24,
  },
  skipLink: {
    color: "var(--primary)",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  // Completitud
  completitudCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  completitudHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  completitudLabel: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },
  completitudValue: {
    fontSize: 13,
    color: "var(--foreground)",
    fontWeight: 600,
  },
  progressContainer: {
    height: 6,
    background: "rgba(0,0,0,0.06)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "var(--primary)",
    borderRadius: "var(--radius-full)",
    transition: "width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
  // Secciones
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
  skillsInput: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
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
  // Acciones
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
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