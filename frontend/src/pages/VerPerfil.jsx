export default function VerPerfil({ perfil, onEditar, onVolver, onVerRecomendaciones }) {
  if (!perfil) return null

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{perfil.nombre_completo}</h2>
        <div style={styles.completitudContainer}>
          <div style={{ ...styles.completitudBar, width: `${perfil.completitud}%` }} />
          <span style={styles.completitudLabel}>{perfil.completitud}% completo</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Datos personales</h3>
        <div style={styles.grid}>
          <Campo label="Email" valor={perfil.email} />
          <Campo label="Teléfono" valor={perfil.telefono} />
          <Campo label="Ubicación" valor={perfil.ubicacion} />
        </div>
      </div>

      <div style={styles.section}>
        <h3>Educación</h3>
        <div style={styles.grid}>
          <Campo label="Nivel educativo" valor={perfil.nivel_educativo} />
          <Campo label="Título" valor={perfil.titulo_educativo} />
          <Campo label="Institución" valor={perfil.institucion_educativa} />
        </div>
      </div>

      <div style={styles.section}>
        <h3>Experiencia</h3>
        <div style={styles.grid}>
          <Campo label="Años de experiencia" valor={perfil.experiencia_anos} />
          <Campo label="Cargo actual" valor={perfil.cargo_actual} />
          <Campo label="Empresa actual" valor={perfil.empresa_actual} />
        </div>
        {perfil.resumen_profesional && (
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 13 }}>Resumen:</strong>
            <p style={{ margin: "4px 0", fontSize: 14, color: "#374151" }}>
              {perfil.resumen_profesional}
            </p>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3>Habilidades</h3>
        <div style={styles.skillsContainer}>
          {perfil.skills?.length > 0 ? (
            perfil.skills.map((s) => (
              <span key={s} style={styles.skillTag}>{s}</span>
            ))
          ) : (
            <span style={{ color: "#999", fontSize: 14 }}>Sin skills registrados</span>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Preferencias laborales</h3>
        <div style={styles.grid}>
          <Campo
            label="Aspiración salarial"
            valor={
              perfil.aspiracion_salarial_min || perfil.aspiracion_salarial_max
                ? `$${(perfil.aspiracion_salarial_min || 0).toLocaleString()} - $${(perfil.aspiracion_salarial_max || 0).toLocaleString()} COP`
                : null
            }
          />
          <Campo label="Modalidad" valor={perfil.modalidad_preferida} />
          <Campo label="Disponibilidad" valor={perfil.disponibilidad} />
        </div>
      </div>

      <div style={styles.botones}>
        <button onClick={onVolver} style={styles.btnSecundario}>
          ← Inicio
        </button>
        <button onClick={onEditar} style={styles.btnSecundario}>
          Editar perfil
        </button>
        {onVerRecomendaciones && (
          <button onClick={onVerRecomendaciones} style={styles.btnPrimario}>
            Ver vacantes recomendadas →
          </button>
        )}
      </div>
    </div>
  )
}

function Campo({ label, valor }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
      <p style={{ margin: "2px 0", fontSize: 14, color: valor ? "#111827" : "#d1d5db" }}>
        {valor || "—"}
      </p>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px",
    textAlign: "left",
  },
  header: {
    marginBottom: 20,
  },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 10px",
    borderRadius: 16,
    fontSize: 13,
  },
  completitudContainer: {
    height: 20,
    background: "#e5e7eb",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
    marginTop: 8,
  },
  completitudBar: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #10b981)",
    borderRadius: 10,
    transition: "width 0.3s ease",
  },
  completitudLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 11,
    fontWeight: 600,
    color: "#1f2937",
  },
  botones: {
    display: "flex",
    gap: 10,
    marginTop: 20,
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
}
