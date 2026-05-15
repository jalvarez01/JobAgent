export default function VerPerfil({ perfil, onEditar, onVolver, onVerRecomendaciones }) {
  if (!perfil) return null

  const fmtSalario = () => {
    const min = perfil.aspiracion_salarial_min
    const max = perfil.aspiracion_salarial_max
    if (!min && !max) return null
    const f = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${f(min)} - ${f(max)} COP`
    return min ? `Desde ${f(min)} COP` : `Hasta ${f(max)} COP`
  }

  return (
    <div style={s.container}>
      {/* Hero */}
      <div style={s.hero} className="animate-fade-in">
        <h1 style={s.title}>Perfil</h1>
        <p style={s.subtitle}>Gestiona tu información y preferencias</p>
      </div>

      {/* Card principal */}
      <div style={s.card} className="animate-slide-up">
        <div style={s.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={s.avatar}>{perfil.nombre_completo?.charAt(0) || "?"}</div>
            <div>
              <h2 style={s.name}>{perfil.nombre_completo}</h2>
              <p style={s.cargoMuted}>{perfil.cargo_actual || "Sin cargo definido"}</p>
            </div>
          </div>
          <button
            onClick={onEditar}
            style={s.btnSecondary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Editar perfil
          </button>
        </div>

        {/* Completitud */}
        <div style={s.completitudWrap}>
          <div style={s.completitudHeader}>
            <span style={s.completitudLabel}>Completitud del perfil</span>
            <span style={s.completitudValue}>{perfil.completitud}%</span>
          </div>
          <div style={s.progressContainer}>
            <div style={{ ...s.progressBar, width: `${perfil.completitud}%` }} />
          </div>
        </div>

        {/* Info grid */}
        <div style={s.grid2}>
          <InfoItem label="Email" value={perfil.email} />
          <InfoItem label="Teléfono" value={perfil.telefono} />
          <InfoItem label="Ubicación" value={perfil.ubicacion} />
          <InfoItem label="Empresa" value={perfil.empresa_actual} />
          <InfoItem label="Nivel educativo" value={perfil.nivel_educativo} />
          <InfoItem label="Título" value={perfil.titulo_educativo} />
          <InfoItem label="Institución" value={perfil.institucion_educativa} />
          <InfoItem label="Experiencia" value={perfil.experiencia_anos != null ? `${perfil.experiencia_anos} años` : null} />
        </div>

        {perfil.resumen_profesional && (
          <div style={s.resumenBox}>
            <span style={s.itemLabel}>Resumen profesional</span>
            <p style={s.resumenText}>{perfil.resumen_profesional}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      <div style={s.card} className="animate-slide-up">
        <h3 style={s.sectionTitle}>Habilidades</h3>
        <div style={s.tags}>
          {perfil.skills?.length > 0 ? (
            perfil.skills.map((sk) => <span key={sk} style={s.tag}>{sk}</span>)
          ) : (
            <span style={s.muted}>Sin habilidades registradas</span>
          )}
        </div>
      </div>

      {/* Preferencias */}
      <div style={s.card} className="animate-slide-up">
        <h3 style={s.sectionTitle}>Preferencias laborales</h3>
        <div style={s.grid2}>
          <InfoItem label="Salario esperado" value={fmtSalario()} />
          <InfoItem label="Modalidad" value={perfil.modalidad_preferida} />
          <InfoItem label="Disponibilidad" value={perfil.disponibilidad} />
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid} className="animate-slide-up">
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.skills?.length || 0}</div>
          <div style={s.statLabel}>Habilidades</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.completitud}%</div>
          <div style={s.statLabel}>Completitud</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.experiencia_anos || 0}</div>
          <div style={s.statLabel}>Años de experiencia</div>
        </div>
      </div>

      {/* Acciones */}
      <div style={s.actions}>
        <button
          onClick={onVolver}
          style={s.btnSecondary}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          ← Inicio
        </button>
        {onVerRecomendaciones && (
          <button
            onClick={onVerRecomendaciones}
            style={s.btnPrimary}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            Ver vacantes recomendadas
          </button>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={s.infoItem}>
      <div style={s.itemLabel}>{label}</div>
      <div style={{ ...s.itemValue, color: value ? "var(--foreground)" : "var(--muted-foreground)" }}>
        {value || "—"}
      </div>
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
    marginBottom: 40,
    textAlign: "center",
  },
  title: {
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    marginBottom: 12,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 21,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
    fontWeight: 400,
  },
  card: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 32,
    marginBottom: 16,
    boxShadow: "var(--shadow-sm)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 500,
    color: "#fff",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    flexShrink: 0,
  },
  name: {
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: 4,
    color: "var(--foreground)",
  },
  cargoMuted: {
    fontSize: 15,
    color: "var(--muted-foreground)",
  },
  completitudWrap: {
    marginBottom: 32,
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
  sectionTitle: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: 18,
    color: "var(--foreground)",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  infoItem: {
    padding: 16,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  itemLabel: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
  itemValue: {
    fontSize: 15,
    fontWeight: 400,
  },
  resumenBox: {
    marginTop: 20,
    padding: 18,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  resumenText: {
    fontSize: 15,
    color: "var(--foreground)",
    marginTop: 8,
    lineHeight: 1.6,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    padding: "7px 16px",
    background: "var(--accent)",
    color: "var(--accent-foreground)",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: "var(--radius-full)",
  },
  muted: {
    color: "var(--muted-foreground)",
    fontSize: 14,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statValue: {
    fontSize: 40,
    fontWeight: 600,
    marginBottom: 6,
    color: "var(--foreground)",
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  actions: {
    display: "flex",
    gap: 12,
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