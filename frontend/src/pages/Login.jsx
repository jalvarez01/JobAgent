import { useState } from "react"
import { login } from "../api/auth"
import { obtenerPerfil } from "../api/perfil"

export default function Login({ onLoginExitoso, onIrARegistro, onIrARecuperar }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) { setError("Ingresa tu email"); return }
    if (!password) { setError("Ingresa tu contraseña"); return }

    setLoading(true)
    try {
      const res = await login(email, password)

      localStorage.setItem("jobagent_session", JSON.stringify({
        perfil_id: res.perfil_id,
        email: res.email,
        nombre: res.nombre_completo,
        access_token: res.access_token,
      }))

      const perfil = await obtenerPerfil(res.perfil_id)
      if (onLoginExitoso) onLoginExitoso(perfil)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card} className="animate-slide-up">
        <div style={s.hero}>
          <h1 style={s.title}>Iniciar sesión</h1>
          <p style={s.subtitle}>Ingresa a tu cuenta de JobAgent</p>
        </div>

        {error && (
          <div style={s.error} role="alert">
            {error}
          </div>
        )}

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

          <div style={s.fieldWrap}>
            <div style={s.labelRow}>
              <label htmlFor="password" style={s.label}>Contraseña</label>
              {onIrARecuperar && (
                <span
                  onClick={onIrARecuperar}
                  style={s.forgotLink}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onIrARecuperar?.()}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                >
                  ¿Olvidaste tu contraseña?
                </span>
              )}
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0071e3")}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={s.footer}>
          <span style={s.muted}>¿No tienes cuenta? </span>
          <span
            onClick={onIrARegistro}
            style={s.link}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onIrARegistro?.()}
          >
            Crear perfil
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
    padding: "24px",
    background: "var(--background)",
  },
  card: {
    width: "100%",
    maxWidth: 440,
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
    marginBottom: 36,
  },
  title: {
    fontSize: 40,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  subtitle: {
    fontSize: 17,
    color: "var(--muted-foreground)",
    lineHeight: 1.4,
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
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--foreground)",
    letterSpacing: "0.01em",
    paddingLeft: 4,
  },
  forgotLink: {
    fontSize: 12,
    color: "var(--primary)",
    cursor: "pointer",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  btnPrimary: {
    width: "100%",
    padding: "13px 28px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 17,
    fontWeight: 400,
    cursor: "pointer",
    marginTop: 12,
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-xs)",
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
  footer: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 15,
  },
  muted: {
    color: "var(--muted-foreground)",
  },
  link: {
    color: "var(--primary)",
    cursor: "pointer",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
}