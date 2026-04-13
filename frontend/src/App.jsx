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

function App() {
  // Si la URL es /admin, mostrar solo el panel admin (separado)
  const isAdmin = window.location.pathname.startsWith("/admin")

  if (isAdmin) {
    return <AdminApp />
  }

  return <MainApp />
}

// ═══════════════════════════════════════════
// APP PRINCIPAL (candidatos)
// ═══════════════════════════════════════════
function MainApp() {
  const [page, setPage] = useState("login")
  const [perfilActual, setPerfilActual] = useState(null)
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  // Recuperar sesión al cargar
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

  const handleLoginExitoso = (perfil) => {
    setPerfilActual(perfil)
    setPage("ver")
  }

  const handlePerfilCreado = (perfil) => {
    setPerfilActual(perfil)
    setPage("ver")
  }

  const handlePerfilActualizado = (perfil) => {
    setPerfilActual(perfil)
    setPage("ver")
  }

  const handleVerDetalle = (vacante) => {
    setVacanteSeleccionada(vacante)
    setPage("detalle")
  }

  const handleLogout = () => {
    localStorage.removeItem("jobagent_session")
    setPerfilActual(null)
    setPage("login")
  }

  if (cargandoSesion) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
        Cargando...
      </div>
    )
  }

  // Sin sesión: mostrar login o registro
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
              <span style={{ color: "rgba(255,255,255,0.4)" }}>¿Ya tienes cuenta? </span>
              <span onClick={() => setPage("login")} style={s.link}>Iniciar sesión</span>
            </div>
          </div>
        </div>
      )
    }
    return <Login onLoginExitoso={handleLoginExitoso} onIrARegistro={() => setPage("registro")} />
  }

  // Con sesión: app completa
  const navItems = [
    { key: "ver", label: "Perfil" },
    { key: "recomendaciones", label: "Vacantes" },
    { key: "tablero", label: "Tablero" },
    { key: "pipeline", label: "Pipeline" },
  ]

  return (
    <div>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <span style={s.logo} onClick={() => setPage("ver")}>JobAgent</span>

          <div style={s.navLinks}>
            {navItems.map((item) => (
              <span
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  ...s.navLink,
                  color: page === item.key ? "#fff" : "rgba(255,255,255,0.5)",
                  borderBottom: page === item.key ? "1px solid #fff" : "1px solid transparent",
                }}
              >
                {item.label}
              </span>
            ))}
            <span onClick={handleLogout} style={{ ...s.navLink, color: "rgba(255,255,255,0.3)" }}>
              Salir
            </span>
          </div>
        </div>
      </nav>

      <main style={s.main}>
        {page === "ver" && (
          <VerPerfil
            perfil={perfilActual}
            onEditar={() => setPage("editar")}
            onVolver={() => setPage("ver")}
            onVerRecomendaciones={() => setPage("recomendaciones")}
          />
        )}
        {page === "editar" && perfilActual && (
          <EditarPerfil
            perfil={perfilActual}
            onPerfilActualizado={handlePerfilActualizado}
            onCancelar={() => setPage("ver")}
          />
        )}
        {page === "recomendaciones" && (
          <Recomendaciones
            perfil={perfilActual}
            onVerDetalle={handleVerDetalle}
            onVolver={() => setPage("ver")}
          />
        )}
        {page === "detalle" && (
          <DetalleVacante
            vacante={vacanteSeleccionada}
            perfilId={perfilActual?.id}
            onVolver={() => setPage("recomendaciones")}
          />
        )}
        {page === "tablero" && (
          <Tablero perfil={perfilActual} onVolver={() => setPage("ver")} />
        )}
        {page === "pipeline" && (
          <PipelineDashboard
            perfil={perfilActual}
            onVerTablero={() => setPage("tablero")}
            onVolver={() => setPage("ver")}
          />
        )}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════
// APP ADMIN (separada, solo en /admin)
// ═══════════════════════════════════════════
function AdminApp() {
  return (
    <div>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <span style={s.logo}>JobAgent</span>
          <span style={s.adminBadge}>Admin Panel</span>
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
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
  },
  navInner: {
    maxWidth: 1200, margin: "0 auto", padding: "20px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: {
    fontSize: 22, letterSpacing: "-0.02em", cursor: "pointer",
    transition: "opacity 0.2s",
  },
  navLinks: { display: "flex", gap: 32 },
  navLink: {
    fontSize: 14, cursor: "pointer", paddingBottom: 4,
    letterSpacing: "0.02em", transition: "color 0.2s",
  },
  main: { paddingTop: 80 },
  link: {
    color: "#fff", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.3)",
  },
  adminBadge: {
    fontSize: 13, color: "rgba(251,191,36,0.9)", border: "1px solid rgba(251,191,36,0.3)",
    padding: "4px 12px", letterSpacing: "0.02em",
  },
}

export default App