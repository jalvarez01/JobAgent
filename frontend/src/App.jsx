import { useState } from "react"
import CrearPerfil from "./pages/CrearPerfil"
import VerPerfil from "./pages/VerPerfil"
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

  const handleVerDetalle = (vacante) => {
    setVacanteSeleccionada(vacante)
    setPage("detalle")
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => setPage(perfilActual ? "ver" : "crear")}>
          JobAgent
        </h1>
        <span style={styles.badge}>MVP</span>

        <nav style={styles.nav}>
          {perfilActual && (
            <>
              <NavBtn label="Perfil" active={page === "ver"} onClick={() => setPage("ver")} />
              <NavBtn label="Vacantes" active={page === "recomendaciones"} onClick={() => setPage("recomendaciones")} />
              <NavBtn label="Tablero" active={page === "tablero"} onClick={() => setPage("tablero")} />
              <NavBtn label="Pipeline" active={page === "pipeline"} onClick={() => setPage("pipeline")} purple />
            </>
          )}
          <NavBtn label="Admin" active={page === "admin"} onClick={() => setPage("admin")} admin />
        </nav>
      </header>

      <main>
        {page === "crear" && (
          <CrearPerfil onPerfilCreado={handlePerfilCreado} />
        )}
        {page === "ver" && (
          <VerPerfil
            perfil={perfilActual}
            onEditar={() => setPage("crear")}
            onVolver={() => setPage("crear")}
            onVerRecomendaciones={() => setPage("recomendaciones")}
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
          <Tablero
            perfil={perfilActual}
            onVolver={() => setPage("ver")}
          />
        )}
        {page === "pipeline" && (
          <PipelineDashboard
            perfil={perfilActual}
            onVerTablero={() => setPage("tablero")}
            onVolver={() => setPage("ver")}
          />
        )}
        {page === "admin" && (
          <AdminVacantes
            onVolver={() => setPage(perfilActual ? "ver" : "crear")}
          />
        )}
      </main>
    </div>
  )
}

function NavBtn({ label, active, onClick, purple, admin }) {
  const bgActive = admin ? "#fef3c7" : purple ? "#ede9fe" : "#eff6ff"
  const colorActive = admin ? "#92400e" : purple ? "#7c3aed" : "#2563eb"
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        background: active ? bgActive : "none",
        color: active ? colorActive : "#6b7280",
        border: admin && !active ? "1px dashed #d1d5db" : "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  )
}

const styles = {
  app: { minHeight: "100vh" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 24px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  logo: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    cursor: "pointer",
    color: "#111827",
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#7c3aed",
    background: "#ede9fe",
    padding: "2px 8px",
    borderRadius: 10,
  },
  nav: {
    display: "flex",
    gap: 4,
    marginLeft: "auto",
  },
}

export default App