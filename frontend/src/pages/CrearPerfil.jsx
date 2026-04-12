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
  nombre_completo: "",
  email: "",
  telefono: "",
  ubicacion: "",
  resumen_profesional: "",
  nivel_educativo: "",
  titulo_educativo: "",
  institucion_educativa: "",
  experiencia_anos: "",
  cargo_actual: "",
  empresa_actual: "",
  skills: [],
  aspiracion_salarial_min: "",
  aspiracion_salarial_max: "",
  modalidad_preferida: "",
  disponibilidad: "",
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

  // --- Paso 1: Subir y analizar CV ---

  const handleUploadCV = async () => {
    if (!file) return
    setLoading(true)
    setError("")
    try {
      const res = await uploadCV(file)
      setCvTexto(res.texto)
      setForm((f) => ({ ...f, cv_texto: res.texto }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalizar = async () => {
    if (!cvTexto.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await analizarCVEstructurado(cvTexto)
      const data = res.resultado
      setAnalisis(data)

      // Pre-llenar el formulario con los datos extraídos
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipCV = () => setPaso(2)

  // --- Paso 2: Formulario de perfil ---

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
    setLoading(true)
    setError("")

    try {
      const payload = {
        ...form,
        experiencia_anos: form.experiencia_anos !== "" ? Number(form.experiencia_anos) : null,
        aspiracion_salarial_min:
          form.aspiracion_salarial_min !== "" ? Number(form.aspiracion_salarial_min) : null,
        aspiracion_salarial_max:
          form.aspiracion_salarial_max !== "" ? Number(form.aspiracion_salarial_max) : null,
        nivel_educativo: form.nivel_educativo || null,
        modalidad_preferida: form.modalidad_preferida || null,
        disponibilidad: form.disponibilidad || null,
      }

      const perfil = await crearPerfil(payload)
      if (onPerfilCreado) onPerfilCreado(perfil)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Cálculo de completitud en tiempo real ---
  const camposCompletitud = [
    "nombre_completo", "email", "telefono", "ubicacion",
    "resumen_profesional", "nivel_educativo", "titulo_educativo",
    "institucion_educativa", "experiencia_anos", "cargo_actual",
    "skills", "aspiracion_salarial_min", "modalidad_preferida",
    "disponibilidad",
  ]
  const llenos = camposCompletitud.filter((c) => {
    const v = form[c]
    return v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
  }).length
  const completitud = Math.round((llenos / camposCompletitud.length) * 100)

  return (
    <div style={styles.container}>
      <h2>Crear perfil profesional</h2>

      {/* Indicador de paso */}
      <div style={styles.pasos}>
        <span style={paso === 1 ? styles.pasoActivo : styles.pasoInactivo}>
          1. Subir CV
        </span>
        <span style={{ margin: "0 8px" }}>→</span>
        <span style={paso === 2 ? styles.pasoActivo : styles.pasoInactivo}>
          2. Completar perfil
        </span>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* ========== PASO 1: SUBIR CV ========== */}
      {paso === 1 && (
        <div>
          <p style={styles.descripcion}>
            Sube tu hoja de vida para que la IA extraiga tus datos automáticamente,
            o salta este paso y llena el formulario manualmente.
          </p>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />

          <div style={styles.botones}>
            <button onClick={handleUploadCV} disabled={!file || loading} style={styles.btnPrimario}>
              {loading && !cvTexto ? "Subiendo..." : "Subir CV"}
            </button>

            {cvTexto && (
              <button
                onClick={handleAnalizar}
                disabled={loading}
                style={styles.btnPrimario}
              >
                {loading ? "Analizando con IA..." : "Analizar y pre-llenar"}
              </button>
            )}

            <button onClick={handleSkipCV} style={styles.btnSecundario}>
              Saltar → Llenar manualmente
            </button>
          </div>

          {cvTexto && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer" }}>Ver texto extraído del CV</summary>
              <pre style={styles.preview}>{cvTexto.slice(0, 1500)}...</pre>
            </details>
          )}
        </div>
      )}

      {/* ========== PASO 2: FORMULARIO ========== */}
      {paso === 2 && (
        <form onSubmit={handleSubmit}>
          {/* Barra de completitud */}
          <div style={styles.completitudContainer}>
            <div style={{ ...styles.completitudBar, width: `${completitud}%` }} />
            <span style={styles.completitudLabel}>{completitud}% completo</span>
          </div>

          {analisis && (
            <div style={styles.infoIA}>
              Datos pre-llenados por IA. Revisa y ajusta lo que sea necesario.
            </div>
          )}

          {/* Datos personales */}
          <fieldset style={styles.fieldset}>
            <legend>Datos personales</legend>
            <div style={styles.grid}>
              <label style={styles.label}>
                Nombre completo *
                <input
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Email *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Teléfono
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Ubicación
                <input
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Medellín, Antioquia"
                  style={styles.input}
                />
              </label>
            </div>
          </fieldset>

          {/* Educación */}
          <fieldset style={styles.fieldset}>
            <legend>Educación</legend>
            <div style={styles.grid}>
              <label style={styles.label}>
                Nivel educativo
                <select
                  name="nivel_educativo"
                  value={form.nivel_educativo}
                  onChange={handleChange}
                  style={styles.input}
                >
                  {NIVELES_EDUCATIVOS.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </label>
              <label style={styles.label}>
                Título
                <input
                  name="titulo_educativo"
                  value={form.titulo_educativo}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Institución
                <input
                  name="institucion_educativa"
                  value={form.institucion_educativa}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
            </div>
          </fieldset>

          {/* Experiencia */}
          <fieldset style={styles.fieldset}>
            <legend>Experiencia</legend>
            <div style={styles.grid}>
              <label style={styles.label}>
                Años de experiencia
                <input
                  name="experiencia_anos"
                  type="number"
                  min="0"
                  max="50"
                  value={form.experiencia_anos}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Cargo actual
                <input
                  name="cargo_actual"
                  value={form.cargo_actual}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Empresa actual
                <input
                  name="empresa_actual"
                  value={form.empresa_actual}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
            </div>
            <label style={styles.label}>
              Resumen profesional
              <textarea
                name="resumen_profesional"
                value={form.resumen_profesional}
                onChange={handleChange}
                rows={3}
                style={{ ...styles.input, resize: "vertical" }}
              />
            </label>
          </fieldset>

          {/* Skills */}
          <fieldset style={styles.fieldset}>
            <legend>Habilidades</legend>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                placeholder="Escribe un skill y presiona Enter"
                style={{ ...styles.input, flex: 1 }}
              />
              <button type="button" onClick={handleAddSkill} style={styles.btnSecundario}>
                Agregar
              </button>
            </div>
            <div style={styles.skillsContainer}>
              {form.skills.map((s) => (
                <span key={s} style={styles.skillTag}>
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={styles.skillRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
              {form.skills.length === 0 && (
                <span style={{ color: "#999", fontSize: 14 }}>Sin skills agregados</span>
              )}
            </div>
          </fieldset>

          {/* Preferencias laborales */}
          <fieldset style={styles.fieldset}>
            <legend>Preferencias laborales</legend>
            <div style={styles.grid}>
              <label style={styles.label}>
                Salario mínimo esperado (COP)
                <input
                  name="aspiracion_salarial_min"
                  type="number"
                  min="0"
                  value={form.aspiracion_salarial_min}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Salario máximo esperado (COP)
                <input
                  name="aspiracion_salarial_max"
                  type="number"
                  min="0"
                  value={form.aspiracion_salarial_max}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Modalidad preferida
                <select
                  name="modalidad_preferida"
                  value={form.modalidad_preferida}
                  onChange={handleChange}
                  style={styles.input}
                >
                  {MODALIDADES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label style={styles.label}>
                Disponibilidad
                <select
                  name="disponibilidad"
                  value={form.disponibilidad}
                  onChange={handleChange}
                  style={styles.input}
                >
                  {DISPONIBILIDADES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          {/* Botones */}
          <div style={styles.botones}>
            <button type="button" onClick={() => setPaso(1)} style={styles.btnSecundario}>
              ← Volver
            </button>
            <button type="submit" disabled={loading} style={styles.btnPrimario}>
              {loading ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// --- Estilos ---
const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px",
    textAlign: "left",
  },
  pasos: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
    fontSize: 14,
  },
  pasoActivo: {
    fontWeight: 600,
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
    paddingBottom: 2,
  },
  pasoInactivo: {
    color: "#999",
  },
  descripcion: {
    color: "#666",
    marginBottom: 16,
    lineHeight: 1.5,
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "8px 12px",
    borderRadius: 6,
    marginBottom: 12,
  },
  infoIA: {
    color: "#1d4ed8",
    background: "#eff6ff",
    padding: "8px 12px",
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 14,
  },
  fileInput: {
    marginBottom: 12,
    display: "block",
  },
  botones: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
  },
  btnPrimario: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  btnSecundario: {
    padding: "10px 20px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  fieldset: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 400,
    width: "100%",
    boxSizing: "border-box",
  },
  preview: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    fontSize: 12,
    maxHeight: 200,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    marginTop: 8,
  },
  completitudContainer: {
    height: 24,
    background: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  completitudBar: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #10b981)",
    borderRadius: 12,
    transition: "width 0.3s ease",
  },
  completitudLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 12,
    fontWeight: 600,
    color: "#1f2937",
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 10px",
    borderRadius: 16,
    fontSize: 13,
  },
  skillRemove: {
    background: "none",
    border: "none",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
}
