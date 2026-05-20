/**
 * Landing page de JobAgent.
 * Se muestra antes del login/registro. Tipo Apple-inspired:
 * hero, features, "cómo funciona", equipo y CTAs.
 */
export default function Landing({ onIrALogin, onIrARegistro }) {
  return (
    <div style={s.page}>
      {/* HERO */}
      <section style={s.hero} className="animate-fade-in">
        <div style={s.heroBadge}>Powered by AI</div>
        <h1 style={s.heroTitle}>
          Tu próximo trabajo,
          <br />
          <span style={s.heroGradient}>encontrado por una IA.</span>
        </h1>
        <p style={s.heroSubtitle}>
          JobAgent es un agente inteligente que estructura tu hoja de vida,
          encuentra vacantes para ti y se postula automáticamente.
        </p>
        <div style={s.heroCtas}>
          <button
            onClick={onIrARegistro}
            style={s.btnPrimary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            Comenzar gratis
          </button>
          <button
            onClick={onIrALogin}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Iniciar sesión
          </button>
        </div>
        <div style={s.heroFooterText}>
          Sube tu CV. Deja que la IA haga el resto.
        </div>
      </section>

      {/* STATS */}
      <section style={s.stats}>
        <StatBox big="5" small="agentes IA" sub="trabajando para ti" />
        <StatBox big="500" small="vacantes" sub="en 14 áreas" />
        <StatBox big="60s" small="tiempo" sub="de tu CV a tu match" />
      </section>

      {/* FEATURES */}
      <section style={s.section}>
        <SectionHeader
          eyebrow="Funciones"
          title="Pensado para ti."
          subtitle="Cada función está diseñada para ahorrarte horas de trabajo manual."
        />

        <div style={s.featuresGrid}>
          <FeatureCard
            emoji="🤖"
            title="Agentes inteligentes"
            text="Cinco agentes especializados analizan, estructuran y validan tu CV automáticamente con Llama 3.3."
          />
          <FeatureCard
            emoji="🎯"
            title="Matching preciso"
            text="Calcula tu compatibilidad con cada vacante en función de tus skills, experiencia y preferencias."
          />
          <FeatureCard
            emoji="📊"
            title="Análisis de brechas"
            text="Descubre qué skills te faltan para desbloquear más vacantes y mide tu progreso."
          />
          <FeatureCard
            emoji="⚡"
            title="Postulación automática"
            text="Con un clic, JobAgent envía tu candidatura. Incluye carta de presentación opcional."
          />
          <FeatureCard
            emoji="📱"
            title="Tablero kanban"
            text="Sigue cada postulación: postulado, en revisión, entrevista, oferta. Todo en un solo lugar."
          />
          <FeatureCard
            emoji="📄"
            title="Exporta tu CV"
            text="Genera un PDF profesional de tu perfil con un clic y úsalo donde quieras."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={s.sectionAlt}>
        <SectionHeader
          eyebrow="En 3 pasos"
          title="Así funciona."
          subtitle="Tan simple que te preguntarás por qué no lo hacías así antes."
        />

        <div style={s.stepsGrid}>
          <StepCard
            num="1"
            title="Sube tu CV"
            text="Un .pdf o .docx. Nuestros agentes lo leerán y extraerán todo: experiencia, skills, educación, idiomas."
          />
          <StepCard
            num="2"
            title="Recibe recomendaciones"
            text="La IA te muestra las vacantes que mejor se ajustan a tu perfil, con un score de compatibilidad."
          />
          <StepCard
            num="3"
            title="Postúlate con un clic"
            text="Manual o automático. JobAgent envía tu candidatura, te notifica y rastrea el estado."
          />
        </div>
      </section>

      {/* TEAM */}
      <section style={s.section}>
        <SectionHeader
          eyebrow="Equipo"
          title="Hecho con cariño."
          subtitle="Cinco estudiantes de Ingeniería de Software de la Universidad EAFIT."
        />

        <div style={s.teamGrid}>
          {[
            "Juan José Álvarez",
            "Diego Andrés Aza",
            "Leovanis Buelvas",
            "Cristian Bolaños",
            "Juan David Bedoya",
          ].map((nombre) => (
            <TeamCard key={nombre} nombre={nombre} />
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={s.ctaFinal}>
        <h2 style={s.ctaTitle}>
          Empieza ahora.
          <br />
          <span style={{ color: "var(--muted-foreground)" }}>Es gratis.</span>
        </h2>
        <p style={s.ctaSubtitle}>
          Tu próximo paso profesional está a un clic de distancia.
        </p>
        <div style={s.heroCtas}>
          <button
            onClick={onIrARegistro}
            style={s.btnPrimary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            Crear mi cuenta
          </button>
          <button
            onClick={onIrALogin}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <span style={s.footerText}>
          JobAgent · Universidad EAFIT · 2026
        </span>
      </footer>
    </div>
  )
}

// ===== Sub-componentes =====

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={s.sectionHeader}>
      <div style={s.eyebrow}>{eyebrow}</div>
      <h2 style={s.sectionTitle}>{title}</h2>
      <p style={s.sectionSubtitle}>{subtitle}</p>
    </div>
  )
}

function StatBox({ big, small, sub }) {
  return (
    <div style={s.statBox}>
      <div style={s.statBig}>{big}</div>
      <div style={s.statSmall}>{small}</div>
      <div style={s.statSub}>{sub}</div>
    </div>
  )
}

function FeatureCard({ emoji, title, text }) {
  return (
    <div style={s.featureCard}>
      <div style={s.featureEmoji}>{emoji}</div>
      <h3 style={s.featureTitle}>{title}</h3>
      <p style={s.featureText}>{text}</p>
    </div>
  )
}

function StepCard({ num, title, text }) {
  return (
    <div style={s.stepCard}>
      <div style={s.stepNum}>{num}</div>
      <h3 style={s.stepTitle}>{title}</h3>
      <p style={s.stepText}>{text}</p>
    </div>
  )
}

function TeamCard({ nombre }) {
  const inicial = nombre.charAt(0)
  return (
    <div style={s.teamCard}>
      <div style={s.teamAvatar}>{inicial}</div>
      <div style={s.teamName}>{nombre}</div>
      <div style={s.teamRole}>Estudiante de Ingeniería de Software</div>
    </div>
  )
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--background)",
  },

  // HERO
  hero: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "120px 24px 100px",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--primary)",
    background: "var(--accent)",
    padding: "6px 16px",
    borderRadius: "var(--radius-full)",
    marginBottom: 28,
    letterSpacing: "0.02em",
  },
  heroTitle: {
    fontSize: 76,
    fontWeight: 600,
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
    marginBottom: 28,
    color: "var(--foreground)",
  },
  heroGradient: {
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: 23,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    maxWidth: 680,
    margin: "0 auto 44px",
    fontWeight: 400,
  },
  heroCtas: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  heroFooterText: {
    fontSize: 14,
    color: "var(--muted-foreground)",
    marginTop: 32,
    fontStyle: "italic",
  },

  // STATS
  stats: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "0 24px 100px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  statBox: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "36px 24px",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statBig: {
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    color: "var(--primary)",
    marginBottom: 8,
  },
  statSmall: {
    fontSize: 17,
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: 2,
  },
  statSub: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },

  // SECTIONS
  section: {
    padding: "100px 24px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  sectionAlt: {
    padding: "100px 24px",
    background: "var(--card-solid)",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: 60,
    maxWidth: 700,
    marginLeft: "auto",
    marginRight: "auto",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--primary)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 48,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    marginBottom: 18,
    color: "var(--foreground)",
  },
  sectionSubtitle: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
  },

  // FEATURES
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    maxWidth: 1100,
    margin: "0 auto",
  },
  featureCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    transition: "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.3s",
  },
  featureEmoji: {
    fontSize: 36,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 8,
    color: "var(--foreground)",
  },
  featureText: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  },

  // STEPS
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    maxWidth: 1000,
    margin: "0 auto",
  },
  stepCard: {
    textAlign: "center",
    padding: 32,
  },
  stepNum: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 600,
    margin: "0 auto 24px",
  },
  stepTitle: {
    fontSize: 21,
    fontWeight: 600,
    letterSpacing: "-0.015em",
    marginBottom: 10,
    color: "var(--foreground)",
  },
  stepText: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
    maxWidth: 280,
    margin: "0 auto",
  },

  // TEAM
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    maxWidth: 1000,
    margin: "0 auto",
  },
  teamCard: {
    textAlign: "center",
    padding: 28,
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 500,
    margin: "0 auto 16px",
  },
  teamName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 4,
    letterSpacing: "-0.005em",
    minHeight: 38,           // reserva espacio para 2 líneas
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
},
  teamRole: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
  },

  // CTA FINAL
  ctaFinal: {
    padding: "120px 24px",
    textAlign: "center",
    maxWidth: 800,
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    marginBottom: 18,
    color: "var(--foreground)",
  },
  ctaSubtitle: {
    fontSize: 19,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    marginBottom: 36,
  },

  // FOOTER
  footer: {
    padding: "40px 24px",
    textAlign: "center",
    borderTop: "1px solid var(--border)",
  },
  footerText: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },

  // BUTTONS
  btnPrimary: {
    padding: "16px 36px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 17,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
    letterSpacing: "-0.01em",
  },
  btnSecondary: {
    padding: "16px 32px",
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-full)",
    fontSize: 17,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
}