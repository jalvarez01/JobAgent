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
    respuesta: "Sí. En el detalle de cualquier vacante encontrarás el botón 'Guardar'. Las vacantes guardadas aparecerán en la sección 'Favoritos' donde puedes revisarlas o eliminarlas cuando quieras.",
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
    respuesta: "Sí. Tu contraseña se almacena cifrada con hash y salt. Tu sesión se autentica con tokens JWT firmados. La información de tu perfil solo es visible para ti cuando inicias sesión. Nunca compartimos tus datos con terceros.",
  },
  {
    pregunta: "¿Puedo modificar mi perfil después de crearlo?",
    respuesta: "Sí. Desde la sección 'Perfil' presiona 'Editar perfil' y podrás modificar cualquier campo: datos personales, educación, experiencia, skills y preferencias laborales.",
  },
]

const CATEGORIAS = [
  {
    titulo: "Gestión del perfil",
    desc: "Crear, editar y completar tu información profesional",
  },
  {
    titulo: "Vacantes y postulaciones",
    desc: "Buscar, filtrar y aplicar a oportunidades",
  },
  {
    titulo: "Favoritos y seguimiento",
    desc: "Guardar vacantes y monitorear tu progreso",
  },
  {
    titulo: "IA y recomendaciones",
    desc: "Cómo funciona nuestro motor inteligente",
  },
]

export default function Ayuda({ onVolver }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div style={s.container}>
      {/* Breadcrumbs */}
      <div style={s.breadcrumbs}>
        <span
          onClick={onVolver}
          style={s.breadLink}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          Inicio
        </span>
        <span style={s.breadSep}>/</span>
        <span style={{ color: "var(--foreground)" }}>Ayuda</span>
      </div>

      {/* Hero */}
      <div style={s.hero} className="animate-fade-in">
        <h1 style={s.title}>Centro de Ayuda</h1>
        <p style={s.subtitle}>
          Encuentra respuestas a las preguntas más frecuentes sobre JobAgent
        </p>
      </div>

      {/* Categorías */}
      <div style={s.categoriesGrid} className="animate-slide-up">
        {CATEGORIAS.map((cat) => (
          <div key={cat.titulo} style={s.categoryCard}>
            <h3 style={s.catTitle}>{cat.titulo}</h3>
            <p style={s.catDesc}>{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={s.faqSection} className="animate-slide-up">
        <h2 style={s.faqHeading}>Preguntas frecuentes</h2>
        <div style={s.faqList}>
          {FAQS.map((faq, i) => (
            <div key={i} style={s.faqItem}>
              <button
                onClick={() => toggle(i)}
                style={s.faqQuestion}
                aria-expanded={openIndex === i}
              >
                <span style={s.faqQuestionText}>{faq.pregunta}</span>
                <span
                  style={{
                    ...s.faqIcon,
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div style={s.faqAnswer}>{faq.respuesta}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginBottom: 32,
  },
  breadLink: {
    cursor: "pointer",
    color: "var(--primary)",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  breadSep: {
    color: "var(--muted-foreground)",
  },
  hero: {
    textAlign: "center",
    marginBottom: 64,
  },
  title: {
    fontSize: 64,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    marginBottom: 16,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 21,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    maxWidth: 560,
    margin: "0 auto",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 72,
  },
  categoryCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
  },
  catTitle: {
    fontSize: 19,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--foreground)",
    letterSpacing: "-0.01em",
  },
  catDesc: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqHeading: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 24,
    color: "var(--foreground)",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  faqItem: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
    transition: "all 0.2s ease",
  },
  faqQuestion: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 28px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    color: "var(--foreground)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  faqQuestionText: {
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  faqIcon: {
    fontSize: 22,
    color: "var(--muted-foreground)",
    transition: "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
    flexShrink: 0,
    marginLeft: 16,
    fontWeight: 300,
  },
  faqAnswer: {
    padding: "0 28px 22px",
    fontSize: 15,
    lineHeight: 1.6,
    color: "var(--muted-foreground)",
  },
}