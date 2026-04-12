export default function VerPerfil({ perfil, onEditar, onVolver, onVerRecomendaciones }) {
  if (!perfil) return null

  return (
    <div style={s.container}>
      <div style={s.hero}>
        <h1 style={s.title}>Perfil</h1>
        <p style={s.subtitle}>Gestiona tu información y preferencias</p>
      </div>

      {/* Profile card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={s.avatar}>{perfil.nombre_completo?.charAt(0) || "?"}</div>
            <div>
              <h2 style={{ fontSize: 28, marginBottom: 4 }}>{perfil.nombre_completo}</h2>
              <p style={s.muted}>{perfil.cargo_actual || "Sin cargo definido"}</p>
            </div>
          </div>
          <button onClick={onEditar} style={s.btnSecondary}>Editar perfil</button>
        </div>

        {/* Completitud */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={s.muted}>Completitud del perfil</span>
            <span style={{ fontSize: 14 }}>{perfil.completitud}%</span>
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
          <div style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.03)" }}>
            <span style={s.labelSmall}>Resumen profesional</span>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 1.6 }}>
              {perfil.resumen_profesional}
            </p>
          </div>
        )}
      </div>

      {/* Skills */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>Habilidades</h3>
        <div style={s.tags}>
          {perfil.skills?.length > 0 ? (
            perfil.skills.map((sk) => <span key={sk} style={s.tag}>{sk}</span>)
          ) : (
            <span style={s.muted}>Sin skills registrados</span>
          )}
        </div>
      </div>

      {/* Preferencias */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>Preferencias laborales</h3>
        <div style={s.grid2}>
          <InfoItem label="Salario esperado" value={
            perfil.aspiracion_salarial_min || perfil.aspiracion_salarial_max
              ? `$${(perfil.aspiracion_salarial_min || 0).toLocaleString()} - $${(perfil.aspiracion_salarial_max || 0).toLocaleString()} COP`
              : null
          } />
          <InfoItem label="Modalidad" value={perfil.modalidad_preferida} />
          <InfoItem label="Disponibilidad" value={perfil.disponibilidad} />
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.skills?.length || 0}</div>
          <div style={s.muted}>Skills</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.completitud}%</div>
          <div style={s.muted}>Completitud</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{perfil.experiencia_anos || 0}</div>
          <div style={s.muted}>Años exp.</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button onClick={onVolver} style={s.btnSecondary}>&#8592; Inicio</button>
        {onVerRecomendaciones && (
          <button onClick={onVerRecomendaciones} style={s.btnPrimary}>Ver vacantes recomendadas &#8594;</button>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={{ padding: 14, background: "rgba(255,255,255,0.03)" }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? "#fff" : "rgba(255,255,255,0.15)" }}>{value || "—"}</div>
    </div>
  )
}

const s = {
  container: { maxWidth: 800, margin: "0 auto", padding: "40px 24px" },
  hero: { marginBottom: 40 },
  title: { fontSize: 48, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 18, color: "rgba(255,255,255,0.5)" },
  card: { border: "1px solid rgba(255,255,255,0.1)", padding: 32, marginBottom: 16 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  avatar: {
    width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, background: "linear-gradient(135deg, #6366f1, #ec4899)",
  },
  sectionTitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  labelSmall: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  muted: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: { padding: "6px 14px", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 },
  statCard: { border: "1px solid rgba(255,255,255,0.1)", padding: 24, textAlign: "center" },
  statValue: { fontSize: 36, marginBottom: 4 },
  progressContainer: { height: 3, background: "rgba(255,255,255,0.1)" },
  progressBar: { height: "100%", background: "#fff", transition: "width 0.3s" },
  btnPrimary: { padding: "14px 28px", background: "#fff", color: "#000", border: "none", fontSize: 14, cursor: "pointer" },
  btnSecondary: { padding: "12px 24px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 14, cursor: "pointer" },
}