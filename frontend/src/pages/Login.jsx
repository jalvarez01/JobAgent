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

    if (!email.trim()) {
      setError("Ingresa tu email")
      return
    }
    if (!password) {
      setError("Ingresa tu contraseña")
      return
    }

    setLoading(true)
    try {
      const res = await login(email, password)

      // Obtener perfil completo
      const perfil = await obtenerPerfil(res.perfil_id)

      // Guardar sesión
      localStorage.setItem("jobagent_session", JSON.stringify({
        perfil_id: res.perfil_id,
        email: res.email,
        nombre: res.nombre_completo,
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

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
            />
          </div>

          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={s.footer}>
          <span style={s.muted}>¿No tienes cuenta? </span>
          <span onClick={onIrARegistro} style={s.link}>Crear perfil</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  card: {
    width: "100%", maxWidth: 420, border: "1px solid rgba(255,255,255,0.1)", padding: 40,
  },
  title: { fontSize: 36, marginBottom: 8, letterSpacing: "-0.03em" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 32 },
  error: {
    color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.2)",
    padding: "10px 14px", marginBottom: 20, fontSize: 14,
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" },
  btnPrimary: {
    width: "100%", padding: "14px 28px", background: "#fff", color: "#000",
    border: "none", fontSize: 15, cursor: "pointer", marginTop: 8,
  },
  footer: { marginTop: 24, textAlign: "center", fontSize: 14 },
  muted: { color: "rgba(255,255,255,0.4)" },
  link: {
    color: "#fff", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.3)",
  },
}