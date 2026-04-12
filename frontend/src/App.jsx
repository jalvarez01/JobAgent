import { useState } from "react"
import CrearPerfil from "./pages/CrearPerfil"
import VerPerfil from "./pages/VerPerfil"
import EditarPerfil from "./pages/EditarPerfil"
import Recomendaciones from "./pages/Recomendaciones"
import DetalleVacante from "./pages/DetalleVacante"
import Tablero from "./pages/Tablero"
import PipelineDashboard from "./pages/PipelineDashboard"
import AdminVacantes from "./pages/AdminVacantes"

function App() {
  const [page, setPage] = useState("crear")
  const [perfilActual, setPerfilActual] = useState(null)
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null)

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

  const navItems = [
    ...(perfilActual ? [
      { key: "ver", label: "Perfil" },
      { key: "recomendaciones", label: "Vacantes" },
      { key: "tablero", label: "Tablero" },
      { key: "pipeline", label: "Pipeline" },
    ] : []),
    { key: "admin", label: "Admin" },
  ]

  return (
    <div>
      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <span
            style={s.logo}
            onClick={() => setPage(perfilActual ? "ver" : "crear")}
          >
            JobAgent
          </span>

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
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={s.main}>
        {page === "crear" && <CrearPerfil onPerfilCreado={handlePerfilCreado} />}
        {page === "ver" && (
          <VerPerfil
            perfil={perfilActual}
            onEditar={() => setPage("editar")}
            onVolver={() => setPage("crear")}
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
        {page === "admin" && (
          <AdminVacantes onVolver={() => setPage(perfilActual ? "ver" : "crear")} />
        )}
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
}

export default App