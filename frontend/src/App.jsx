import { useState, useEffect } from "react"
import { obtenerPerfil } from "./api/perfil"
import Login from "./pages/Login"
import CrearPerfil from "./pages/CrearPerfil"
import VerPerfil from "./pages/VerPerfil"
import EditarPerfil from "./pages/EditarPerfil"
import Recomendaciones from "./pages/Recomendaciones"
import DetalleVacante from "./pages/DetalleVacante"
import Tablero from "./pages/Tablero"
import PipelineDashboard from "./pages/PipelineDashboard"
import AdminVacantes from "./pages/AdminVacantes"
import AdminEntrevistas from "./pages/AdminEntrevistas"
import AdminPostulaciones from "./pages/AdminPostulaciones"
import Favoritos from "./pages/Favoritos"
import Entrevistas from "./pages/Entrevistas"
import Ayuda from "./pages/Ayuda"
import NotificacionesBell from "./pages/NotificacionesBell"
import RecuperarPassword from "./pages/RecuperarPassword"
import ResetPassword from "./pages/ResetPassword"

const ADMIN_USER = "admin"
const ADMIN_PASS = "admin"

function App() {
  const path = window.location.pathname

  // Ruta especial: enlace de reset directo desde el "email"
  if (path === "/reset-password") {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    return <ResetPasswordRoute token={token} />
  }

  if (path.startsWith("/admin")) return <AdminApp />
  return <MainApp />
}

function ResetPasswordRoute({ token }) {
  const irAlInicio = () => { window.location.href = "/" }
  return (
    <div>
      <SimpleNav onLogoClick={irAlInicio} />
      <main style={s.main}>
        <ResetPassword
          token={token}
          onVolverLogin={irAlInicio}
          onPasswordCambiado={irAlInicio}
        />
      </main>
    </div>
  )
}

function MainApp() {
  const [page, setPage] = useState("login")
  const [perfilActual, setPerfilActual] = useState(null)
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [tokenRecuperacion, setTokenRecuperacion] = useState(null)

  useEffect(() => {
    const restaurarSesion = async () => {
      try {
        const saved = localStorage.getItem("jobagent_session")
        if (saved) {
          const session = JSON.parse(saved)
          if (session.perfil_id) {
            const perfil = await obtenerPerfil(session.perfil_id)
            setPerfilActual(perfil)
            setPage("ver")
          }
        }
      } catch (err) {
        console.error("Error restaurando sesión:", err)
        localStorage.removeItem("jobagent_session")
      } finally {
        setCargandoSesion(false)
      }
    }
    restaurarSesion()
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (!perfilActual) return
      if (e.altKey) {
        const map = { p: "ver", v: "recomendaciones", f: "favoritos", e: "entrevistas", t: "tablero", l: "pipeline", a: "ayuda" }
        const target = map[e.key.toLowerCase()]
        if (target) {
          e.preventDefault()
          setPage(target)
        }
        if (e.key === "?") {
          e.preventDefault()
          setShowShortcuts(true)
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [perfilActual])

  const handleLoginExitoso = (perfil) => { setPerfilActual(perfil); setPage("ver") }
  const handlePerfilCreado = (perfil) => { setPerfilActual(perfil); setPage("ver") }
  const handlePerfilActualizado = (perfil) => { setPerfilActual(perfil); setPage("ver") }
  const handleVerDetalle = (vacante) => { setVacanteSeleccionada(vacante); setPage("detalle") }
  const handleLogout = () => {
    localStorage.removeItem("jobagent_session")
    setPerfilActual(null)
    setPage("login")
  }

  if (cargandoSesion) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.spinner} />
      </div>
    )
  }

  if (!perfilActual) {
    if (page === "registro") {
      return (
        <div>
          <SimpleNav onLogoClick={() => setPage("login")} />
          <main style={s.main}>
            <CrearPerfil onPerfilCreado={handlePerfilCreado} />
            <div style={s.signinPrompt}>
              <span style={{ color: "var(--muted-foreground)" }}>¿Ya tienes cuenta? </span>
              <span onClick={() => setPage("login")} style={s.linkInline}>Iniciar sesión</span>
            </div>
          </main>
        </div>
      )
    }

    if (page === "recuperar") {
      return (
        <div>
          <SimpleNav onLogoClick={() => setPage("login")} />
          <main style={s.main}>
            <RecuperarPassword
              onVolverLogin={() => setPage("login")}
              onIrAReset={(token) => {
                setTokenRecuperacion(token)
                setPage("reset")
              }}
            />
          </main>
        </div>
      )
    }

    if (page === "reset") {
      return (
        <div>
          <SimpleNav onLogoClick={() => setPage("login")} />
          <main style={s.main}>
            <ResetPassword
              token={tokenRecuperacion}
              onVolverLogin={() => setPage("login")}
              onPasswordCambiado={() => setPage("login")}
            />
          </main>
        </div>
      )
    }

    return (
      <Login
        onLoginExitoso={handleLoginExitoso}
        onIrARegistro={() => setPage("registro")}
        onIrARecuperar={() => setPage("recuperar")}
      />
    )
  }

  const navItems = [
    { key: "ver", label: "Perfil", shortcut: "P" },
    { key: "recomendaciones", label: "Vacantes", shortcut: "V" },
    { key: "favoritos", label: "Favoritos", shortcut: "F" },
    { key: "entrevistas", label: "Entrevistas", shortcut: "E" },
    { key: "tablero", label: "Tablero", shortcut: "T" },
    { key: "pipeline", label: "Pipeline", shortcut: "L" },
    { key: "ayuda", label: "Ayuda", shortcut: "A" },
  ]

  return (
    <div>
      <nav style={s.nav} role="navigation" aria-label="Navegación principal">
        <div style={s.navInner}>
          <span style={s.logo} onClick={() => setPage("ver")}>JobAgent</span>

          <div style={s.navLinks}>
            {navItems.map((item) => (
              <span
                key={item.key}
                onClick={() => setPage(item.key)}
                role="link"
                tabIndex={0}
                aria-current={page === item.key ? "page" : undefined}
                aria-label={`${item.label} (Alt + ${item.shortcut})`}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPage(item.key)}
                style={{
                  ...s.navLink,
                  color: page === item.key ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: page === item.key ? 500 : 400,
                }}
                onMouseEnter={(e) => page !== item.key && (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => page !== item.key && (e.currentTarget.style.color = "var(--muted-foreground)")}
              >
                {item.label}
              </span>
            ))}
            <NotificacionesBell perfilId={perfilActual.id} />
            <span
              onClick={handleLogout}
              role="button"
              tabIndex={0}
              style={{ ...s.navLink, color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              Salir
            </span>
          </div>
        </div>
      </nav>

      <main style={s.main}>
        {page === "ver" && <VerPerfil perfil={perfilActual} onEditar={() => setPage("editar")} onVolver={() => setPage("crear")} onVerRecomendaciones={() => setPage("recomendaciones")} />}
        {page === "editar" && perfilActual && <EditarPerfil perfil={perfilActual} onPerfilActualizado={handlePerfilActualizado} onCancelar={() => setPage("ver")} />}
        {page === "recomendaciones" && <Recomendaciones perfil={perfilActual} onVerDetalle={handleVerDetalle} onVolver={() => setPage("ver")} />}
        {page === "favoritos" && <Favoritos perfil={perfilActual} onVerDetalle={handleVerDetalle} onVolver={() => setPage("ver")} />}
        {page === "entrevistas" && <Entrevistas perfil={perfilActual} onVolver={() => setPage("ver")} />}
        {page === "detalle" && <DetalleVacante vacante={vacanteSeleccionada} perfilId={perfilActual?.id} onVolver={() => setPage("recomendaciones")} />}
        {page === "tablero" && <Tablero perfil={perfilActual} onVolver={() => setPage("ver")} />}
        {page === "pipeline" && <PipelineDashboard perfil={perfilActual} onVerTablero={() => setPage("tablero")} onVolver={() => setPage("ver")} />}
        {page === "ayuda" && <Ayuda onVolver={() => setPage("ver")} />}
      </main>

      {showShortcuts && (
        <div style={s.modalOverlay} onClick={() => setShowShortcuts(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
            <h2 style={{ fontSize: 24, marginBottom: 6, fontWeight: 600 }}>Atajos de teclado</h2>
            <p style={{ fontSize: 15, color: "var(--muted-foreground)", marginBottom: 24 }}>
              Navega más rápido con estos atajos
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                ["Perfil", "Alt + P"], ["Vacantes", "Alt + V"], ["Favoritos", "Alt + F"],
                ["Entrevistas", "Alt + E"], ["Tablero", "Alt + T"], ["Pipeline", "Alt + L"],
                ["Ayuda", "Alt + A"], ["Ver atajos", "Alt + ?"],
              ].map(([label, key]) => (
                <div key={key} style={s.shortcutRow}>
                  <span style={{ fontSize: 15 }}>{label}</span>
                  <kbd>{key}</kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              style={{ ...s.btnPrimary, marginTop: 24, width: "100%" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0071e3")}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminApp() {
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const flag = localStorage.getItem("jobagent_admin_session")
    if (flag === "ok") setAutenticado(true)
    setVerificando(false)
  }, [])

  const handleLoginAdmin = (success) => {
    if (success) {
      localStorage.setItem("jobagent_admin_session", "ok")
      setAutenticado(true)
    }
  }

  const handleLogoutAdmin = () => {
    localStorage.removeItem("jobagent_admin_session")
    setAutenticado(false)
  }

  if (verificando) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.spinner} />
      </div>
    )
  }

  if (!autenticado) {
    return <AdminLogin onLogin={handleLoginAdmin} />
  }

  return <AdminPanel onLogout={handleLogoutAdmin} />
}

function AdminLogin({ onLogin }) {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
      onLogin(true)
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  return (
    <div style={s.adminLoginContainer}>
      <div style={s.adminLoginCard} className="animate-slide-up">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={s.adminBadgeLarge}>Admin</span>
          <h1 style={s.adminLoginTitle}>Panel de administración</h1>
          <p style={s.adminLoginSubtitle}>Acceso restringido al equipo de RH</p>
        </div>

        {error && (
          <div style={s.adminLoginError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={s.fieldWrap}>
            <label htmlFor="admin-user" style={s.label}>Usuario</label>
            <input
              id="admin-user"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label htmlFor="admin-pass" style={s.label}>Contraseña</label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...s.btnPrimary, marginTop: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0071e3")}
          >
            Iniciar sesión
          </button>
        </form>

        <div style={s.adminLoginFooter}>
          <span
            onClick={() => { window.location.href = "/" }}
            style={s.linkInline}
          >
            ← Volver al sitio
          </span>
        </div>
      </div>
    </div>
  )
}

function AdminPanel({ onLogout }) {
  const path = window.location.pathname
  const inicial = path.includes("/entrevistas") ? "entrevistas"
    : path.includes("/postulaciones") ? "postulaciones" : "vacantes"
  const [adminPage, setAdminPage] = useState(inicial)

  const handleNav = (page) => {
    setAdminPage(page)
    const newPath = page === "vacantes" ? "/admin" : `/admin/${page}`
    window.history.pushState({}, "", newPath)
  }

  return (
    <div>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={s.logo}>JobAgent</span>
            <span style={s.adminBadge}>Admin</span>
          </div>
          <div style={s.navLinks}>
            <span
              onClick={() => handleNav("vacantes")}
              style={{
                ...s.navLink,
                color: adminPage === "vacantes" ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: adminPage === "vacantes" ? 500 : 400,
              }}
            >
              Vacantes
            </span>
            <span
              onClick={() => handleNav("postulaciones")}
              style={{
                ...s.navLink,
                color: adminPage === "postulaciones" ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: adminPage === "postulaciones" ? 500 : 400,
              }}
            >
              Postulaciones
            </span>
            <span
              onClick={() => handleNav("entrevistas")}
              style={{
                ...s.navLink,
                color: adminPage === "entrevistas" ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: adminPage === "entrevistas" ? 500 : 400,
              }}
            >
              Entrevistas
            </span>
            <span onClick={onLogout} style={{ ...s.navLink, color: "var(--muted-foreground)" }}>
              Cerrar sesión
            </span>
          </div>
        </div>
      </nav>
      <main style={s.main}>
        {adminPage === "vacantes" && <AdminVacantes onVolver={onLogout} />}
        {adminPage === "postulaciones" && <AdminPostulaciones onVolver={onLogout} />}
        {adminPage === "entrevistas" && <AdminEntrevistas onVolver={onLogout} />}
      </main>
    </div>
  )
}

function SimpleNav({ onLogoClick }) {
  return (
    <nav style={s.nav}>
      <div style={s.navInner}>
        <span style={s.logo} onClick={onLogoClick}>JobAgent</span>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 48,
    borderBottom: "1px solid var(--border)",
    background: "rgba(255, 255, 255, 0.72)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
  },
  navInner: {
    maxWidth: 1024,
    margin: "0 auto",
    height: "100%",
    padding: "0 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 21,
    fontWeight: 600,
    letterSpacing: "-0.015em",
    cursor: "pointer",
    color: "var(--foreground)",
  },
  navLinks: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    fontSize: 12,
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "color 0.2s ease",
    userSelect: "none",
  },
  main: {
    paddingTop: 48,
    minHeight: "100vh",
  },
  signinPrompt: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
    paddingBottom: 40,
  },
  linkInline: {
    color: "var(--primary)",
    cursor: "pointer",
    fontWeight: 500,
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  adminBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--warning)",
    background: "var(--warning-bg)",
    padding: "3px 10px",
    borderRadius: "var(--radius-full)",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  adminBadgeLarge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--warning)",
    background: "var(--warning-bg)",
    padding: "4px 14px",
    borderRadius: "var(--radius-full)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: "var(--card-solid)",
    padding: 32,
    maxWidth: 440,
    width: "100%",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
  },
  shortcutRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 4px",
    borderBottom: "1px solid var(--border)",
  },
  btnPrimary: {
    padding: "13px 28px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: 17,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  adminLoginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "var(--background)",
  },
  adminLoginCard: {
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
  adminLoginTitle: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: 8,
    color: "var(--foreground)",
  },
  adminLoginSubtitle: {
    fontSize: 15,
    color: "var(--muted-foreground)",
  },
  adminLoginError: {
    color: "var(--destructive)",
    background: "var(--destructive-bg)",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 14,
  },
  adminLoginFooter: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 14,
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
    letterSpacing: "0.01em",
    paddingLeft: 4,
  },
}

export default App