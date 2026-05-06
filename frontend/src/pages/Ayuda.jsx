import { useState } from "react"

const FAQS = [
  {
    pregunta: "¿Cómo creo mi perfil en JobAgent?",
    respuesta: "Ve a 'Crear perfil' desde la pantalla de inicio. Puedes subir tu hoja de vida en formato PDF o DOCX para que la IA extraiga tus datos automáticamente, o llenar el formulario manualmente. Necesitarás definir una contraseña de mínimo 8 caracteres con al menos una mayúscula y una minúscula.",
  },
  {
    pregunta: "¿Qué formatos de CV se aceptan?",
    respuesta: "JobAgent acepta archivos PDF y DOCX. El sistema extrae el texto y usa inteligencia artificial para identificar tus habilidades, experiencia, educación y datos de contacto.",
  },
  {
    pregunta: "¿Cómo funcionan las recomendaciones de vacantes?",
    respuesta: "Nuestro motor de recomendación compara los skills de tu perfil con los requisitos de cada vacante. El porcentaje de match indica qué tan bien encajas. Adicionalmente se considera tu modalidad preferida y tu rango salarial esperado para mejorar la relevancia.",
  },
  {
    pregunta: "¿Qué significa el porcentaje de match en una vacante?",
    respuesta: "El porcentaje representa la proporción de skills requeridos que tienes en tu perfil. Un match alto (70% o más) indica una excelente coincidencia. Si es medio (40-70%) puedes postularte pero quizá necesites desarrollar algunas habilidades. Si es bajo, considera adquirir los skills faltantes primero.",
  },
  {
    pregunta: "¿Puedo guardar vacantes para revisarlas después?",
    respuesta: "Sí. En el detalle de cualquier vacante encontrarás el botón '☆ Guardar'. Las vacantes guardadas aparecerán en la sección 'Favoritos' donde puedes revisarlas o eliminarlas cuando quieras.",
  },
  {
    pregunta: "¿Cómo me postulo a una vacante?",
    respuesta: "Abre el detalle de la vacante y presiona el botón 'Postularme a esta vacante'. Tu perfil completo se enviará automáticamente. Verás el estado de tus postulaciones en la sección 'Tablero'.",
  },
  {
    pregunta: "¿Qué es el Pipeline de agentes?",
    respuesta: "Es nuestra característica más avanzada: cinco agentes de IA trabajan en secuencia para analizar tu perfil, cargar vacantes, calcular recomendaciones, postular automáticamente a las que tengan match alto (50% o más), y generar próximos pasos personalizados.",
  },
  {
    pregunta: "¿Cómo funciona el tablero de seguimiento?",
    respuesta: "Es un tablero estilo Kanban con cinco columnas: Postulado, En revisión, Entrevista, Oferta y Descartado. Puedes mover tus postulaciones entre estados haciendo clic en los botones de cada tarjeta. También tienes una vista de historial con todas las actividades.",
  },
  {
    pregunta: "¿Mis datos están seguros?",
    respuesta: "Sí. Tu contraseña se almacena cifrada con hash y salt. La información de tu perfil solo es visible para ti cuando inicias sesión. Nunca compartimos tus datos con terceros.",
  },
  {
    pregunta: "¿Puedo modificar mi perfil después de crearlo?",
    respuesta: "Sí. Desde la sección 'Perfil' presiona 'Editar perfil' y podrás modificar cualquier campo: datos personales, educación, experiencia, skills y preferencias laborales.",
  },
]

const CATEGORIAS = [
  { titulo: "Gestión del perfil", desc: "Crear, editar y completar tu información profesional" },
  { titulo: "Vacantes y postulaciones", desc: "Buscar, filtrar y aplicar a oportunidades" },
  { titulo: "Favoritos y seguimiento", desc: "Guardar vacantes y monitorear tu progreso" },
  { titulo: "IA y recomendaciones", desc: "Cómo funciona nuestro motor inteligente" },
]

export default function Ayuda({ onVolver }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div style={s.container}>
      {/* Breadcrumbs */}
      <div style={s.breadcrumbs}>
        <span onClick={onVolver} style={s.breadLink}>Inicio</span>
        <span style={s.breadSep}>/</span>
        <span style={{ color: "#1a1a1a" }}>Ayuda</span>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.iconCircle}>?</div>
        <h1 style={s.title}>Centro de Ayuda</h1>
        <p style={s.subtitle}>
          Encuentra respuestas a las preguntas más frecuentes sobre JobAgent
        </p>
      </div>

      {/* Categorías */}
      <div style={s.categoriesGrid}>
        {CATEGORIAS.map((cat) => (
          <div key={cat.titulo} style={s.categoryCard}>
            <div style={s.catIcon}>•</div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>{cat.titulo}</h3>
            <p style={s.muted}>{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 60 }}>
        <h2 style={{ fontSize: 28, marginBottom: 24 }}>Preguntas frecuentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={s.faqItem}>
              <button
                onClick={() => toggle(i)}
                style={s.faqQuestion}
                aria-expanded={openIndex === i}
              >
                <span style={{ fontSize: 16, fontWeight: 500 }}>{faq.pregunta}</span>
                <span style={{ fontSize: 20, color: "rgba(0,0,0,0.4)", transform: openIndex === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </button>
              {openIndex === i && (
                <div style={s.faqAnswer}>{faq.respuesta}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Atajos de teclado */}
      <div style={s.tipBox}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Consejo rápido</h3>
        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 12 }}>
          Usa atajos de teclado para navegar más rápido entre secciones:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ShortcutChip label="Perfil" k="Alt + P" />
          <ShortcutChip label="Vacantes" k="Alt + V" />
          <ShortcutChip label="Favoritos" k="Alt + F" />
          <ShortcutChip label="Tablero" k="Alt + T" />
          <ShortcutChip label="Pipeline" k="Alt + L" />
          <ShortcutChip label="Ayuda" k="Alt + A" />
        </div>
      </div>

      {/* Soporte */}
      <div style={s.supportBox}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>¿No encuentras lo que buscas?</h2>
        <p style={{ ...s.muted, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
          Nuestro equipo de soporte está disponible para ayudarte. Contáctanos y te responderemos lo antes posible.
        </p>
        <a href="mailto:soporte@jobagent.com" style={s.btnPrimary}>Contactar soporte</a>
      </div>
    </div>
  )
}

function ShortcutChip({ label, k }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#fff", border: "1px solid rgba(0,0,0,0.1)", fontSize: 12 }}>
      {label} <kbd>{k}</kbd>
    </div>
  )
}

const s = {
  container: { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
  breadcrumbs: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 32 },
  breadLink: { cursor: "pointer", color: "rgba(0,0,0,0.6)" },
  breadSep: { color: "rgba(0,0,0,0.3)" },
  hero: { textAlign: "center", marginBottom: 60 },
  iconCircle: {
    width: 64, height: 64, borderRadius: "50%", background: "#f5f5f5",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, margin: "0 auto 20px", color: "#1a1a1a",
  },
  title: { fontSize: 56, marginBottom: 12, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 18, color: "rgba(0,0,0,0.55)", maxWidth: 600, margin: "0 auto" },
  muted: { color: "rgba(0,0,0,0.55)", fontSize: 14 },
  categoriesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  categoryCard: {
    border: "1px solid rgba(0,0,0,0.1)", padding: 24, transition: "border-color 0.2s",
    cursor: "default",
  },
  catIcon: { fontSize: 24, marginBottom: 12, color: "#1a1a1a" },
  faqItem: { border: "1px solid rgba(0,0,0,0.1)" },
  faqQuestion: {
    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", background: "transparent", border: "none", textAlign: "left",
    color: "#1a1a1a",
  },
  faqAnswer: {
    padding: "0 24px 20px", fontSize: 14, lineHeight: 1.7, color: "rgba(0,0,0,0.7)",
  },
  tipBox: {
    marginTop: 60, padding: 28, background: "#fafafa", border: "1px solid rgba(0,0,0,0.08)",
  },
  supportBox: {
    marginTop: 40, padding: 48, border: "1px solid rgba(0,0,0,0.1)", textAlign: "center",
  },
  btnPrimary: {
    display: "inline-block", padding: "14px 28px", background: "#1a1a1a", color: "#fff",
    border: "none", fontSize: 14, cursor: "pointer", textDecoration: "none",
  },
}