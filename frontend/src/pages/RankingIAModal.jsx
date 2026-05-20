import { useState, useEffect } from "react"
import { obtenerRankingCandidatos } from "../api/ai"

/**
 * Modal que ejecuta el ranking de candidatos con IA para una vacante.
 *
 * Uso desde AdminVacantes:
 *   const [vacanteRanking, setVacanteRanking] = useState(null)
 *   <button onClick={() => setVacanteRanking(vacante)}>Top con IA</button>
 *   {vacanteRanking && (
 *     <RankingIAModal vacante={vacanteRanking} onClose={() => setVacanteRanking(null)} />
 *   )}
 */
export default function RankingIAModal({ vacante, onClose }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!vacante?.id) return
    setLoading(true); setError(""); setData(null)
    obtenerRankingCandidatos(vacante.id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [vacante?.id])

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
        <div style={s.header}>
          <div>
            <div style={s.badge}>Análisis con IA</div>
            <h2 style={s.title}>Top candidatos</h2>
            <p style={s.subtitle}>
              {vacante.titulo} <span style={{ color: "var(--muted-foreground)" }}>·</span> {vacante.empresa}
            </p>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Cerrar">×</button>
        </div>

        {loading && (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Analizando candidatos con IA...</p>
            <p style={s.loadingSub}>Esto puede tomar 5–15 segundos</p>
          </div>
        )}

        {error && (
          <div style={s.error}>
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            <div style={s.metaBox}>
              <div style={s.metaText}>{data.mensaje}</div>
              {data.uso_ia ? (
                <span style={s.iaTag}>Generado con Llama 3.3</span>
              ) : (
                <span style={s.fallbackTag}>Modo determinista</span>
              )}
            </div>

            {data.ranking.length === 0 ? (
              <div style={s.emptyBox}>
                <h3 style={{ fontSize: 17, marginBottom: 6, color: "var(--foreground)" }}>
                  Sin candidatos elegibles
                </h3>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                  Ningún candidato en el sistema cumple los requisitos mínimos.
                </p>
              </div>
            ) : (
              <div style={s.ranking}>
                {data.ranking.map((c, i) => (
                  <CandidatoCard key={c.perfil_id} candidato={c} posicion={i + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CandidatoCard({ candidato, posicion }) {
  const colorScore = (sc) => {
    if (sc >= 80) return "var(--success)"
    if (sc >= 60) return "var(--warning)"
    return "var(--destructive)"
  }

  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div style={s.rank}>{posicion}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.candName}>{candidato.nombre}</div>
          <div style={s.candEmail}>{candidato.email}</div>
        </div>
        <div style={s.scoreBox}>
          <div style={{ ...s.scoreValue, color: colorScore(candidato.score) }}>
            {candidato.score}
          </div>
          <div style={s.scoreLabel}>match</div>
        </div>
      </div>

      {candidato.explicacion && (
        <div style={s.explicacion}>{candidato.explicacion}</div>
      )}

      <div style={s.detailsGrid}>
        <div style={s.detailBox}>
          <div style={s.detailLabel}>✓ Fortalezas</div>
          <div style={s.detailText}>{candidato.fortalezas || "—"}</div>
        </div>
        <div style={s.detailBox}>
          <div style={s.detailLabel}>⚠ A reforzar</div>
          <div style={s.detailText}>{candidato.debilidades || "—"}</div>
        </div>
      </div>

      <div style={s.skillsRow}>
        {candidato.skills_match?.length > 0 && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.skillsLabel}>Skills que cubre ({candidato.skills_match.length})</div>
            <div style={s.tags}>
              {candidato.skills_match.slice(0, 8).map((sk) => (
                <span key={sk} style={s.skillOk}>{sk}</span>
              ))}
              {candidato.skills_match.length > 8 && (
                <span style={s.muted}>+{candidato.skills_match.length - 8}</span>
              )}
            </div>
          </div>
        )}
        {candidato.skills_faltantes?.length > 0 && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.skillsLabel}>Le faltan ({candidato.skills_faltantes.length})</div>
            <div style={s.tags}>
              {candidato.skills_faltantes.slice(0, 6).map((sk) => (
                <span key={sk} style={s.skillMiss}>{sk}</span>
              ))}
              {candidato.skills_faltantes.length > 6 && (
                <span style={s.muted}>+{candidato.skills_faltantes.length - 6}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 1000,
    padding: 40,
    overflowY: "auto",
  },
  modal: {
    background: "var(--card-solid)",
    padding: 36,
    maxWidth: 820,
    width: "100%",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    margin: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
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
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: 6,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--foreground)",
    fontWeight: 500,
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.04)",
    border: "none",
    fontSize: 22,
    color: "var(--muted-foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 1,
  },
  metaBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: "var(--foreground)",
  },
  iaTag: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--primary)",
    background: "var(--accent)",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
  },
  fallbackTag: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--warning)",
    background: "var(--warning-bg)",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 60,
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
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
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "16px 20px",
    fontSize: 14,
  },
  emptyBox: {
    textAlign: "center",
    padding: 60,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  ranking: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 22,
    background: "var(--card-solid)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  rank: {
    width: 40, height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
    flexShrink: 0,
  },
  candName: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 2,
    letterSpacing: "-0.01em",
  },
  candEmail: {
    fontSize: 13,
    color: "var(--muted-foreground)",
  },
  scoreBox: {
    textAlign: "center",
    flexShrink: 0,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 10,
    color: "var(--muted-foreground)",
    marginTop: 4,
    fontWeight: 500,
  },
  explicacion: {
    fontSize: 14,
    color: "var(--foreground)",
    background: "var(--accent)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    marginBottom: 14,
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  detailBox: {
    padding: 12,
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    marginBottom: 4,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  detailText: {
    fontSize: 13,
    color: "var(--foreground)",
    lineHeight: 1.5,
  },
  skillsRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  skillsLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },
  skillOk: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--success)",
    padding: "3px 10px",
    background: "var(--success-bg)",
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
  },
  skillMiss: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--warning)",
    padding: "3px 10px",
    background: "var(--warning-bg)",
    borderRadius: "var(--radius-full)",
    textTransform: "capitalize",
  },
  muted: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    fontStyle: "italic",
    alignSelf: "center",
  },
}