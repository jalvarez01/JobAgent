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
import Favoritos from "./pages/Favoritos"
import Ayuda from "./pages/Ayuda"

function App() {
  const isAdmin = window.location.pathname.startsWith("/admin")
  if (isAdmin) return <AdminApp />
  return <MainApp />
}

function MainApp() {
  const [page, setPage] = useState("login")
  const [perfilActual, setPerfilActual] = useState(null)
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)

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

  // Atajos de teclado para accesibilidad
  useEffect(() => {
    const handleKey = (e) => {
      if (!perfilActual) return
      if (e.altKey) {
        const map = { p: "ver", v: "recomendaciones", f: "favoritos", t: "tablero", l: "pipeline", a: "ayuda" }
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.4)" }}>
        Cargando...
      </div>
    )
  }

  if (!perfilActual) {
    if (page === "registro") {
      return (
        <div>
          <nav style={s.nav}>
            <div style={s.navInner}>
              <span style={s.logo} onClick={() => setPage("login")}>JobAgent</span>
            </div>
          </nav>
          <div style={s.main}>
            <CrearPerfil onPerfilCreado={handlePerfilCreado} />
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
              <span style={{ color: "rgba(0,0,0,0.5)" }}>¿Ya tienes cuenta? </span>
              <span onClick={() => setPage("login")} style={s.link}>Iniciar sesión</span>
            </div>
          </div>
        </div>
      )
    }
    return <Login onLoginExitoso={handleLoginExitoso} onIrARegistro={() => setPage("registro")} />
  }

  const navItems = [
    { key: "ver", label: "Perfil", shortcut: "P" },
    { key: "recomendaciones", label: "Vacantes", shortcut: "V" },
    { key: "favoritos", label: "Favoritos", shortcut: "F" },
    { key: "tablero", label: "Tablero", shortcut: "T" },
    { key: "pipeline", label: "Pipeline", shortcut: "L" },
    { key: "ayuda", label: "Ayuda", shortcut: "A" },
  ]

  return (
    <div>
      <nav style={s.nav} role="navigation" aria-label="Navegación principal">
        <div style={s.navInner}>
          <span style={s.logo} onClick={() => setPage("ver")} aria-label="Ir al perfil">JobAgent</span>

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
                  color: page === item.key ? "#1a1a1a" : "rgba(0,0,0,0.5)",
                  borderBottom: page === item.key ? "1px solid #1a1a1a" : "1px solid transparent",
                  fontWeight: page === item.key ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            ))}
            <span
              onClick={handleLogout}
              role="button"
              tabIndex={0}
              style={{ ...s.navLink, color: "rgba(0,0,0,0.4)" }}
              aria-label="Cerrar sesión"
            >
              Salir
            </span>
          </div>
        </div>
      </nav>

      <main style={s.main}>
        {page === "ver" && (
          <VerPerfil perfil={perfilActual} onEditar={() => setPage("editar")} onVolver={() => setPage("crear")} onVerRecomendaciones={() => setPage("recomendaciones")} />
        )}
        {page === "editar" && perfilActual && (
          <EditarPerfil perfil={perfilActual} onPerfilActualizado={handlePerfilActualizado} onCancelar={() => setPage("ver")} />
        )}
        {page === "recomendaciones" && (
          <Recomendaciones perfil={perfilActual} onVerDetalle={handleVerDetalle} onVolver={() => setPage("ver")} />
        )}
        {page === "favoritos" && (
          <Favoritos perfil={perfilActual} onVerDetalle={handleVerDetalle} onVolver={() => setPage("ver")} />
        )}
        {page === "detalle" && (
          <DetalleVacante vacante={vacanteSeleccionada} perfilId={perfilActual?.id} onVolver={() => setPage("recomendaciones")} />
        )}
        {page === "tablero" && (
          <Tablero perfil={perfilActual} onVolver={() => setPage("ver")} />
        )}
        {page === "pipeline" && (
          <PipelineDashboard perfil={perfilActual} onVerTablero={() => setPage("tablero")} onVolver={() => setPage("ver")} />
        )}
        {page === "ayuda" && (
          <Ayuda onVolver={() => setPage("ver")} />
        )}
      </main>

      {/* Modal de atajos */}
      {showShortcuts && (
        <div style={s.modalOverlay} onClick={() => setShowShortcuts(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Atajos de teclado</h2>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", marginBottom: 20 }}>Navega más rápido con estos atajos</p>
            {[
              ["Perfil", "Alt + P"],
              ["Vacantes", "Alt + V"],
              ["Favoritos", "Alt + F"],
              ["Tablero", "Alt + T"],
              ["Pipeline", "Alt + L"],
              ["Ayuda", "Alt + A"],
              ["Ver atajos", "Alt + ?"],
            ].map(([label, key]) => (
              <div key={key} style={s.shortcutRow}>
                <span>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)} style={{ ...s.btnPrimary, marginTop: 16, width: "100%" }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminApp() {
  return (
    <div>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <span style={s.logo}>JobAgent</span>
          <span style={s.adminBadge}>Panel Administrativo</span>
        </div>
      </nav>
      <main style={s.main}>
        <AdminVacantes onVolver={() => { window.location.href = "/" }} />
      </main>
    </div>
  )
}

const s = {
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
  },
  navInner: {
    maxWidth: 1200, margin: "0 auto", padding: "20px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: { fontSize: 22, letterSpacing: "-0.02em", cursor: "pointer", color: "#1a1a1a" },
  navLinks: { display: "flex", gap: 28 },
  navLink: { fontSize: 14, cursor: "pointer", paddingBottom: 4, transition: "color 0.2s" },
  main: { paddingTop: 80 },
  link: { color: "#1a1a1a", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.3)" },
  adminBadge: {
    fontSize: 13, color: "#92400e", border: "1px solid rgba(146,64,14,0.3)",
    background: "#fef3c7", padding: "4px 12px", borderRadius: 4,
  },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modal: {
    background: "#fff", padding: 32, maxWidth: 420, width: "90%",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  shortcutRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", fontSize: 14,
  },
  btnPrimary: { padding: "12px 24px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 14, cursor: "pointer" },
}

export default App