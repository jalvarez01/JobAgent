import { useState, useEffect } from "react"
import { validarTokenRecuperacion, cambiarPasswordConToken } from "../api/recuperacion"

export default function ResetPassword({ token, onVolverLogin, onPasswordCambiado }) {
  const [validando, setValidando] = useState(true)
  const [tokenValido, setTokenValido] = useState(false)
  const [emailAsociado, setEmailAsociado] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!token) {
      setValidando(false)
      setTokenValido(false)
      return
    }
    validarTokenRecuperacion(token)
      .then((res) => {
        setTokenValido(res.valido)
        if (res.valido) setEmailAsociado(res.email || "")
      })
      .catch(() => setTokenValido(false))
      .finally(() => setValidando(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!password || password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres")
    if (!/[A-Z]/.test(password)) return setError("La contraseña debe tener al menos una letra mayúscula")
    if (!/[a-z]/.test(password)) return setError("La contraseña debe tener al menos una letra minúscula")
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden")

    setLoading(true)
    try {
      await cambiarPasswordConToken(token, password)
      setExito(true)
      setTimeout(() => {
        if (onPasswordCambiado) onPasswordCambiado()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (validando) {
    return (
      <div style={s.container}>
        <div style={s.spinner} />
      </div>
    )
  }

  if (!tokenValido) {
    return (
      <div style={s.container}>
        <div style={s.card} className="animate-slide-up">
          <div style={{ textAlign: "center" }}>
            <div style={s.errorIcon}>!</div>
            <h1 style={s.title}>Enlace inválido o expirado</h1>
            <p style={s.subtitle}>
              El enlace que usaste ya no es válido. Es posible que haya expirado o que ya haya sido utilizado para cambiar la contraseña.
            </p>
            <button
              onClick={onVolverLogin}
              style={{ ...s.btnPrimary, marginTop: 24, width: "100%" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (exito) {
    return (
      <div style={s.container}>
        <div style={s.card} className="animate-slide-up">
          <div style={{ textAlign: "center" }}>
            <div style={s.successIcon}>✓</div>
            <h1 style={s.title}>Contraseña actualizada</h1>
            <p style={s.subtitle}>
              Tu contraseña fue cambiada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <p style={s.smallMuted}>Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.card} className="animate-slide-up">
        <div style={s.hero}>
          <h1 style={s.title}>Nueva contraseña</h1>
          <p style={s.subtitle}>
            {emailAsociado && (
              <>Cuenta: <strong style={{ color: "var(--foreground)" }}>{emailAsociado}</strong></>
            )}
          </p>
        </div>

        {error && (
          <div style={s.error} role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldWrap}>
            <label htmlFor="new-pass" style={s.label}>Nueva contraseña</label>
            <input
              id="new-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín 8 caracteres, 1 mayúscula, 1 minúscula"
              autoComplete="new-password"
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label htmlFor="confirm-pass" style={s.label}>Confirmar contraseña</label>
            <input
              id="confirm-pass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
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
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        <div style={s.footer}>
          <span
            onClick={onVolverLogin}
            style={s.link}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onVolverLogin?.()}
          >
            ← Cancelar
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
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  card: {
    width: "100%",
    maxWidth: 460,
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
  smallMuted: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    marginTop: 16,
    fontStyle: "italic",
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--destructive-bg)",
    color: "var(--destructive)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 600,
    margin: "0 auto 20px",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--success-bg)",
    color: "var(--success)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 600,
    margin: "0 auto 20px",
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
    marginTop: 8,
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
  footer: {
    marginTop: 28,
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