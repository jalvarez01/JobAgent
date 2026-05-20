import { useState, useEffect } from "react"
import { generarPreguntasEntrevista, generarMensajeInvitacion } from "../api/ai"
import { listarTodasVacantes } from "../api/vacantes"
import { listarTodasPostulaciones } from "../api/postulaciones"

/**
 * Asistente de Entrevistas con IA — vista del admin.
 *
 * Permite:
 *   1. Generar preguntas personalizadas según un candidato + vacante.
 *   2. Generar un mensaje de invitación a entrevista.
 *
 * Acceso desde el panel admin (agregar como nueva pestaña o sub-vista de Entrevistas).
 */
export default function AdminEntrevistasIA({ onVolver }) {
  const [postulaciones, setPostulaciones] = useState([])
  const [vacantes, setVacantes] = useState([])
  const [seleccion, setSeleccion] = useState(null)
  // seleccion = { perfil_id, perfil_nombre, perfil_email, vacante_id, vacante_titulo, vacante_empresa }
  const [modo, setModo] = useState("preguntas")  // 'preguntas' | 'invitacion'
  const [cargandoListas, setCargandoListas] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  // Estados de ambas funciones IA
  const [preguntasData, setPreguntasData] = useState(null)
  const [loadingPreguntas, setLoadingPreguntas] = useState(false)
  const [errorPreguntas, setErrorPreguntas] = useState("")

  const [invitData, setInvitData] = useState(null)
  const [loadingInvit, setLoadingInvit] = useState(false)
  const [errorInvit, setErrorInvit] = useState("")
  const [copiado, setCopiado] = useState(false)

  // Form de invitación
  const [formInvit, setFormInvit] = useState({
    fecha: "",
    modalidad: "virtual",
    duracion_minutos: 45,
    link_reunion: "",
    nombre_entrevistador: "",
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargandoListas(true)
    try {
      const [posts, vacs] = await Promise.all([
        listarTodasPostulaciones(),
        listarTodasVacantes(),
      ])
      setPostulaciones(posts)
      setVacantes(vacs)
    } catch (err) {
      console.error(err)
    } finally {
      setCargandoListas(false)
    }
  }

  const handleSeleccionar = (post) => {
    setSeleccion({
      perfil_id: post.perfil_id,
      perfil_nombre: post.perfil_nombre || "Candidato",
      perfil_email: post.perfil_email || "",
      vacante_id: post.vacante_id,
      vacante_titulo: post.vacante_titulo || "Vacante",
      vacante_empresa: post.vacante_empresa || "",
    })
    setPreguntasData(null); setErrorPreguntas("")
    setInvitData(null); setErrorInvit("")
  }

  const handleGenerarPreguntas = async () => {
    if (!seleccion) return
    setLoadingPreguntas(true); setErrorPreguntas(""); setPreguntasData(null)
    try {
      const res = await generarPreguntasEntrevista(seleccion.perfil_id, seleccion.vacante_id)
      setPreguntasData(res)
    } catch (err) {
      setErrorPreguntas(err.message)
    } finally {
      setLoadingPreguntas(false)
    }
  }

  const handleGenerarInvitacion = async () => {
    if (!seleccion) return
    setLoadingInvit(true); setErrorInvit(""); setInvitData(null)
    try {
      const payload = {
        perfil_id: seleccion.perfil_id,
        vacante_id: seleccion.vacante_id,
        ...formInvit,
        duracion_minutos: Number(formInvit.duracion_minutos) || 45,
      }
      const res = await generarMensajeInvitacion(payload)
      setInvitData(res)
    } catch (err) {
      setErrorInvit(err.message)
    } finally {
      setLoadingInvit(false)
    }
  }

  const handleCopiar = async () => {
    if (!invitData) return
    const texto = `Asunto: ${invitData.asunto}\n\n${invitData.cuerpo}`
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("No se pudo copiar:", err)
    }
  }

  const filtradas = postulaciones.filter((p) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (p.perfil_nombre || "").toLowerCase().includes(q)
      || (p.vacante_titulo || "").toLowerCase().includes(q)
      || (p.vacante_empresa || "").toLowerCase().includes(q)
  })

  return (
    <div style={s.container}>
      <div style={s.heroRow} className="animate-fade-in">
        <div>
          <div style={s.badge}>Asistente con IA</div>
          <h1 style={s.title}>Entrevistas asistidas por IA</h1>
          <p style={s.subtitle}>
            Genera preguntas personalizadas y mensajes de invitación con Llama 3.3
          </p>
        </div>
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

      {/* Paso 1: Seleccionar candidato + vacante */}
      <div style={s.card} className="animate-slide-up">
        <h3 style={s.sectionTitle}>1. Selecciona un candidato y vacante</h3>
        <p style={s.hint}>
          Solo se muestran postulaciones existentes. La IA tomará los datos del perfil y de la vacante para personalizar el contenido.
        </p>

        <input
          placeholder="Buscar por candidato, vacante o empresa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ marginTop: 16, marginBottom: 16 }}
        />

        {cargandoListas ? (
          <div style={s.loading}><div style={s.spinner} /></div>
        ) : filtradas.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
              No hay postulaciones para mostrar. Pídele a un candidato que se postule primero.
            </p>
          </div>
        ) : (
          <div style={s.postList}>
            {filtradas.slice(0, 30).map((p) => {
              const seleccionada =
                seleccion?.perfil_id === p.perfil_id &&
                seleccion?.vacante_id === p.vacante_id
              return (
                <div
                  key={p.id}
                  onClick={() => handleSeleccionar(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSeleccionar(p)}
                  style={{
                    ...s.postRow,
                    borderColor: seleccionada ? "var(--primary)" : "var(--border)",
                    background: seleccionada ? "var(--accent)" : "var(--card-solid)",
                  }}
                >
                  <div style={s.postAvatar}>
                    {(p.perfil_nombre || "?").charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.postName}>{p.perfil_nombre || "Sin nombre"}</div>
                    <div style={s.postRole}>
                      {p.vacante_titulo} <span style={{ color: "var(--muted-foreground)" }}>·</span> {p.vacante_empresa}
                    </div>
                  </div>
                  {seleccionada && <span style={s.checkMark}>✓</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {seleccion && (
        <>
          {/* Tabs */}
          <div style={s.tabs} className="animate-slide-up">
            <button
              onClick={() => setModo("preguntas")}
              style={{ ...s.tab, ...(modo === "preguntas" ? s.tabActive : {}) }}
            >
              Generar preguntas
            </button>
            <button
              onClick={() => setModo("invitacion")}
              style={{ ...s.tab, ...(modo === "invitacion" ? s.tabActive : {}) }}
            >
              Generar invitación
            </button>
          </div>

          {/* PREGUNTAS */}
          {modo === "preguntas" && (
            <div style={s.card} className="animate-slide-up">
              <div style={s.sectionRow}>
                <div>
                  <h3 style={s.sectionTitle}>Preguntas para {seleccion.perfil_nombre}</h3>
                  <p style={s.hint}>Personalizadas según su perfil y la vacante seleccionada</p>
                </div>
                <button
                  onClick={handleGenerarPreguntas}
                  disabled={loadingPreguntas}
                  style={{ ...s.btnPrimary, opacity: loadingPreguntas ? 0.6 : 1 }}
                  onMouseEnter={(e) => !loadingPreguntas && (e.currentTarget.style.background = "#0077ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                >
                  {loadingPreguntas ? "Generando..." : "Generar con IA"}
                </button>
              </div>

              {errorPreguntas && <div style={s.error}>{errorPreguntas}</div>}

              {loadingPreguntas && (
                <div style={s.loadingBig}>
                  <div style={s.spinner} />
                  <p style={s.loadingText}>Analizando perfil y vacante...</p>
                  <p style={s.loadingSub}>Esto puede tomar 5–15 segundos</p>
                </div>
              )}

              {preguntasData && !loadingPreguntas && (
                <div style={{ marginTop: 20 }}>
                  <div style={s.iaTag}>Generado con Llama 3.3 vía Groq</div>
                  <div style={s.preguntasList}>
                    {preguntasData.preguntas.map((q, i) => (
                      <PreguntaCard key={i} pregunta={q} numero={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVITACIÓN */}
          {modo === "invitacion" && (
            <div style={s.card} className="animate-slide-up">
              <h3 style={s.sectionTitle}>Mensaje de invitación a entrevista</h3>
              <p style={s.hint}>Para: {seleccion.perfil_nombre} {seleccion.perfil_email && `(${seleccion.perfil_email})`}</p>

              <div style={s.formGrid}>
                <FieldInv label="Fecha y hora" value={formInvit.fecha}
                  onChange={(v) => setFormInvit((f) => ({ ...f, fecha: v }))}
                  placeholder="Ej: martes 28 de mayo, 10:00 AM" />
                <SelectInv label="Modalidad" value={formInvit.modalidad}
                  onChange={(v) => setFormInvit((f) => ({ ...f, modalidad: v }))}
                  options={[
                    { value: "virtual", label: "Virtual" },
                    { value: "presencial", label: "Presencial" },
                    { value: "telefonica", label: "Telefónica" },
                  ]} />
                <FieldInv label="Duración (minutos)" type="number" value={formInvit.duracion_minutos}
                  onChange={(v) => setFormInvit((f) => ({ ...f, duracion_minutos: v }))} />
                <FieldInv label="Nombre del entrevistador" value={formInvit.nombre_entrevistador}
                  onChange={(v) => setFormInvit((f) => ({ ...f, nombre_entrevistador: v }))}
                  placeholder="Opcional" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldInv label="Link de reunión" value={formInvit.link_reunion}
                    onChange={(v) => setFormInvit((f) => ({ ...f, link_reunion: v }))}
                    placeholder="https://meet... (opcional)" />
                </div>
              </div>

              <div style={s.sectionRow}>
                <span style={s.hint}>Todos los campos son opcionales. Si no los completas, la IA lo indicará en el mensaje.</span>
                <button
                  onClick={handleGenerarInvitacion}
                  disabled={loadingInvit}
                  style={{ ...s.btnPrimary, opacity: loadingInvit ? 0.6 : 1 }}
                  onMouseEnter={(e) => !loadingInvit && (e.currentTarget.style.background = "#0077ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                >
                  {loadingInvit ? "Generando..." : "Generar mensaje"}
                </button>
              </div>

              {errorInvit && <div style={s.error}>{errorInvit}</div>}

              {loadingInvit && (
                <div style={s.loadingBig}>
                  <div style={s.spinner} />
                  <p style={s.loadingText}>Redactando mensaje...</p>
                </div>
              )}

              {invitData && !loadingInvit && (
                <div style={s.invitResult}>
                  <div style={s.iaTag}>Generado con Llama 3.3 vía Groq</div>
                  <div style={s.invitBox}>
                    <div style={s.invitLabelRow}>
                      <span style={s.invitLabel}>Asunto</span>
                      <span style={s.invitTo}>Para: {invitData.candidato_email}</span>
                    </div>
                    <div style={s.invitSubject}>{invitData.asunto}</div>
                    <div style={s.invitDivider} />
                    <div style={s.invitLabel}>Cuerpo del mensaje</div>
                    <div style={s.invitBody}>{invitData.cuerpo}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      onClick={handleCopiar}
                      style={s.btnSecondary}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {copiado ? "Copiado ✓" : "Copiar mensaje"}
                    </button>
                    {invitData.candidato_email && (
                      <a
                        href={`mailto:${invitData.candidato_email}?subject=${encodeURIComponent(invitData.asunto)}&body=${encodeURIComponent(invitData.cuerpo)}`}
                        style={{ ...s.btnPrimary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                      >
                        Abrir en email
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PreguntaCard({ pregunta, numero }) {
  const colorCategoria = {
    "técnica": "var(--primary)",
    "comportamental": "#7c3aed",
    "experiencia": "var(--success)",
    "motivación": "var(--warning)",
    "cierre": "var(--muted-foreground)",
  }
  const color = colorCategoria[pregunta.categoria] || "var(--muted-foreground)"

  return (
    <div style={s.preguntaCard}>
      <div style={s.preguntaTop}>
        <div style={s.preguntaNumero}>{numero}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.preguntaTexto}>{pregunta.pregunta}</div>
          <div style={s.preguntaMeta}>
            <span style={{ ...s.categoriaChip, color, borderColor: color }}>
              {pregunta.categoria}
            </span>
            {pregunta.objetivo && (
              <span style={s.objetivo}>Objetivo: {pregunta.objetivo}</span>
            )}
          </div>
          {pregunta.pista && (
            <div style={s.pista}>
              <span style={s.pistaLabel}>Pista para el entrevistador:</span> {pregunta.pista}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldInv({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.fieldLabel}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function SelectInv({ label, value, onChange, options }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.fieldLabel}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
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
  badge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--primary)",
    background: "var(--accent)",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    marginBottom: 12,
    letterSpacing: "0.02em",
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  subtitle: { fontSize: 17, color: "var(--muted-foreground)" },
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
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 8,
    color: "var(--foreground)",
  },
  sectionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  },
  loading: { display: "flex", justifyContent: "center", padding: 40 },
  loadingBig: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 50,
    gap: 14,
  },
  loadingText: {
    fontSize: 15,
    color: "var(--foreground)",
    fontWeight: 500,
  },
  loadingSub: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  spinner: {
    width: 32, height: 32,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyBox: {
    textAlign: "center",
    padding: 40,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginTop: 12,
    fontSize: 14,
  },
  postList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 420,
    overflowY: "auto",
  },
  postRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 16px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  postAvatar: {
    width: 36, height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  postName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
  },
  postRole: {
    fontSize: 12,
    color: "var(--foreground)",
  },
  checkMark: {
    color: "var(--primary)",
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0,
  },
  // Tabs
  tabs: {
    display: "flex",
    gap: 4,
    background: "rgba(0,0,0,0.04)",
    padding: 4,
    borderRadius: "var(--radius-full)",
    marginBottom: 16,
    width: "fit-content",
  },
  tab: {
    padding: "8px 18px",
    background: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "var(--card-solid)",
    color: "var(--foreground)",
    boxShadow: "var(--shadow-xs)",
  },
  iaTag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--primary)",
    background: "var(--accent)",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    marginBottom: 16,
  },
  preguntasList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  preguntaCard: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: 16,
    background: "var(--card-solid)",
  },
  preguntaTop: {
    display: "flex",
    gap: 14,
  },
  preguntaNumero: {
    width: 28, height: 28,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  preguntaTexto: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: 8,
    lineHeight: 1.45,
  },
  preguntaMeta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  categoriaChip: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 10px",
    border: "1px solid",
    borderRadius: "var(--radius-full)",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  objetivo: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    fontStyle: "italic",
  },
  pista: {
    fontSize: 12,
    color: "var(--foreground)",
    background: "rgba(0,0,0,0.025)",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    lineHeight: 1.5,
    marginTop: 4,
  },
  pistaLabel: {
    fontWeight: 600,
  },
  // Invitación
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--foreground)",
    paddingLeft: 4,
  },
  invitResult: {
    marginTop: 20,
  },
  invitBox: {
    background: "var(--card-solid)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: 22,
  },
  invitLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  invitLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  invitTo: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
  invitSubject: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 16,
    letterSpacing: "-0.005em",
  },
  invitDivider: {
    height: 1,
    background: "var(--border)",
    margin: "16px 0",
  },
  invitBody: {
    fontSize: 14,
    lineHeight: 1.65,
    color: "var(--foreground)",
    whiteSpace: "pre-wrap",
    marginTop: 8,
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