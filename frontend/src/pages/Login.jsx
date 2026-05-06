import { useState } from "react"
import { login } from "../api/auth"
import { obtenerPerfil } from "../api/perfil"

export default function Login({ onLoginExitoso, onIrARegistro }) {
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
      const perfil = await obtenerPerfil(res.perfil_id)
      localStorage.setItem("jobagent_session", JSON.stringify({
        perfil_id: res.perfil_id, email: res.email, nombre: res.nombre_completo,
      }))
      if (onLoginExitoso) onLoginExitoso(perfil)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>Iniciar sesión</h1>
        <p style={s.subtitle}>Ingresa a tu cuenta de JobAgent</p>

        {error && <div style={s.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.fieldWrap}>
            <label htmlFor="email" style={s.label}>Email</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label htmlFor="password" style={s.label}>Contraseña</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={s.footer}>
          <span style={s.muted}>¿No tienes cuenta? </span>
          <span onClick={onIrARegistro} style={s.link} role="button" tabIndex={0}>Crear perfil</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, border: "1px solid rgba(0,0,0,0.1)", padding: 40, background: "#fff" },
  title: { fontSize: 36, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 16, color: "rgba(0,0,0,0.5)", marginBottom: 32 },
  error: { color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)", background: "#fef2f2", padding: "10px 14px", marginBottom: 20, fontSize: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 },
  label: { fontSize: 13, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" },
  btnPrimary: { width: "100%", padding: "14px 28px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 15, cursor: "pointer", marginTop: 8 },
  footer: { marginTop: 24, textAlign: "center", fontSize: 14 },
  muted: { color: "rgba(0,0,0,0.5)" },
  link: { color: "#1a1a1a", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.3)" },
}