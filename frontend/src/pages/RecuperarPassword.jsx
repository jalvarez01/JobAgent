import { useState } from "react"
import { solicitarRecuperacion } from "../api/recuperacion"

export default function RecuperarPassword({ onVolverLogin, onIrAReset }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setResultado(null)
    if (!email.trim()) return setError("Ingresa tu email")

    setLoading(true)
    try {
      const res = await solicitarRecuperacion(email.trim())
      setResultado(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const enlaceCompleto = resultado?.token
    ? `${window.location.origin}/reset-password?token=${resultado.token}`
    : null

  const handleCopiar = async () => {
    if (!enlaceCompleto) return
    try {
      await navigator.clipboard.writeText(enlaceCompleto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("No se pudo copiar:", err)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card} className="animate-slide-up">
        <div style={s.hero}>
          <h1 style={s.title}>Recuperar contraseña</h1>
          <p style={s.subtitle}>
            {resultado?.token
              ? "Usa el enlace generado para crear una nueva contraseña"
              : "Ingresa tu email y te enviaremos un enlace de recuperación"}
          </p>
        </div>

        {error && (
          <div style={s.error} role="alert">{error}</div>
        )}

        {!resultado ? (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fieldWrap}>
              <label htmlFor="email" style={s.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              {loading ? "Generando enlace..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        ) : (
          <div>
            {resultado.token ? (
              <>
                <div style={s.successBox}>
                  <strong>Enlace generado correctamente.</strong>
                </div>

                <div style={s.demoNotice}>
                  Como esta versión no cuenta con servidor de correo, el enlace se muestra aquí. En producción llegaría directamente a tu bandeja de entrada.
                </div>

                <div style={s.linkBox}>
                  <span style={s.linkLabel}>Tu enlace de recuperación</span>
                  <div style={s.linkValue}>{enlaceCompleto}</div>
                </div>

                <div style={s.actions}>
                  <button
                    onClick={handleCopiar}
                    style={s.btnSecondary}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {copiado ? "Copiado ✓" : "Copiar enlace"}
                  </button>
                  <button
                    onClick={() => onIrAReset && onIrAReset(resultado.token)}
                    style={s.btnPrimary}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
                  >
                    Continuar al reset
                  </button>
                </div>
              </>
            ) : (
              <div style={s.infoBox}>
                <strong>{resultado.mensaje}</strong>
                <p style={s.muted}>
                  Si tu email está registrado, recibirás el enlace en unos minutos.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={s.footer}>
          <span
            onClick={onVolverLogin}
            style={s.link}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onVolverLogin?.()}
          >
            ← Volver a iniciar sesión
          </span>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "var(--background)",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "var(--card)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "48px 40px",
    boxShadow: "var(--shadow-md)",
  },
  hero: {
    textAlign: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.15,
    marginBottom: 10,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 15,
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--foreground)",
    paddingLeft: 4,
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
    marginTop: 4,
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
  error: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 14,
  },
  successBox: {
    color: "#1d7d3f",
    background: "var(--success-bg)",
    border: "1px solid rgba(52, 199, 89, 0.25)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  demoNotice: {
    color: "var(--warning)",
    background: "var(--warning-bg)",
    border: "1px solid rgba(255, 149, 0, 0.25)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 1.5,
  },
  infoBox: {
    color: "var(--primary)",
    background: "var(--accent)",
    border: "1px solid rgba(0, 113, 227, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "16px 18px",
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.5,
  },
  muted: {
    color: "var(--muted-foreground)",
    fontSize: 13,
    marginTop: 6,
  },
  linkBox: {
    background: "rgba(0,0,0,0.025)",
    borderRadius: "var(--radius-md)",
    padding: 16,
    marginBottom: 20,
  },
  linkLabel: {
    display: "block",
    fontSize: 12,
    color: "var(--muted-foreground)",
    marginBottom: 8,
    fontWeight: 500,
  },
  linkValue: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: 12,
    color: "var(--foreground)",
    wordBreak: "break-all",
    background: "var(--card-solid)",
    padding: 12,
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "var(--primary)",
    cursor: "pointer",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
}