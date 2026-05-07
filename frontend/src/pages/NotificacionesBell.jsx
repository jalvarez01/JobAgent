import { useState, useEffect, useRef } from "react"
import {
  listarNotificaciones, contarNoLeidas,
  marcarLeida, marcarTodasLeidas, eliminarNotificacion,
} from "../api/notificaciones"

const COLORS = {
  cambio_estado: "#1e40af",
  entrevista_programada: "#7c3aed",
  entrevista_calificada: "#d97706",
  sistema: "#1a1a1a",
}

export default function NotificacionesBell({ perfilId }) {
  const [abierto, setAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!perfilId) return
    cargarConteo()
    const interval = setInterval(cargarConteo, 30000)
    return () => clearInterval(interval)
  }, [perfilId])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    if (abierto) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [abierto])

  const cargarConteo = async () => {
    try {
      const res = await contarNoLeidas(perfilId)
      setNoLeidas(res.no_leidas)
    } catch (err) {
      console.error("Error cargando conteo:", err)
    }
  }

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      const data = await listarNotificaciones(perfilId)
      setNotificaciones(data)
    } catch (err) {
      console.error("Error cargando notificaciones:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAbrir = async () => {
    if (!abierto) await cargarNotificaciones()
    setAbierto(!abierto)
  }

  const handleClickNotif = async (notif) => {
    if (!notif.leida) {
      try {
        await marcarLeida(notif.id)
        setNotificaciones((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, leida: true } : n)
        )
        setNoLeidas((c) => Math.max(0, c - 1))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidas(perfilId)
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
      setNoLeidas(0)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEliminar = async (e, notifId) => {
    e.stopPropagation()
    try {
      await eliminarNotificacion(notifId)
      const eliminada = notificaciones.find((n) => n.id === notifId)
      setNotificaciones((prev) => prev.filter((n) => n.id !== notifId))
      if (eliminada && !eliminada.leida) setNoLeidas((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const fmtFecha = (f) => {
    if (!f) return ""
    const fecha = new Date(f)
    const ahora = new Date()
    const diffMin = Math.floor((ahora - fecha) / 60000)
    if (diffMin < 1) return "Ahora"
    if (diffMin < 60) return `Hace ${diffMin} min`
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)} h`
    return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
  }

  return (
    <div ref={dropdownRef} style={s.wrapper}>
      <button
        onClick={handleAbrir}
        style={{
          ...s.trigger,
          color: abierto ? "#1a1a1a" : "rgba(0,0,0,0.5)",
          fontWeight: noLeidas > 0 ? 500 : 400,
        }}
        aria-label={`Notificaciones${noLeidas > 0 ? ` (${noLeidas} sin leer)` : ""}`}
      >
        Notificaciones
        {noLeidas > 0 && (
          <span style={s.badge}>{noLeidas > 9 ? "9+" : noLeidas}</span>
        )}
      </button>

      {abierto && (
        <div style={s.dropdown}>
          <div style={s.header}>
            <h3 style={{ fontSize: 16, fontWeight: 500 }}>Notificaciones</h3>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} style={s.markAllBtn}>
                Marcar todas leídas
              </button>
            )}
          </div>

          <div style={s.list}>
            {loading ? (
              <p style={s.empty}>Cargando...</p>
            ) : notificaciones.length === 0 ? (
              <div style={s.empty}>
                <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)" }}>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotif(notif)}
                  style={{
                    ...s.item,
                    background: notif.leida ? "#fff" : "#f9fafb",
                    borderLeft: `3px solid ${COLORS[notif.tipo] || COLORS.sistema}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 2,
                    }}>
                      {!notif.leida && <span style={s.dotNew} />}
                      <span style={{
                        fontSize: 14, fontWeight: notif.leida ? 400 : 500,
                        color: "#1a1a1a",
                      }}>
                        {notif.titulo}
                      </span>
                    </div>
                    <p style={s.msg}>{notif.mensaje}</p>
                    <span style={s.time}>{fmtFecha(notif.created_at)}</span>
                  </div>
                  <button onClick={(e) => handleEliminar(e, notif.id)} style={s.removeBtn} aria-label="Eliminar">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrapper: { position: "relative" },
  trigger: {
    background: "transparent", border: "none", cursor: "pointer",
    fontSize: 14, padding: "4px 0", display: "inline-flex",
    alignItems: "center", gap: 6, fontFamily: "inherit",
    transition: "color 0.2s",
  },
  badge: {
    minWidth: 18, height: 18,
    background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 600,
    borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 5px",
  },
  dropdown: {
    position: "absolute", top: 36, right: 0, width: 380, maxHeight: 500,
    background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden",
    display: "flex", flexDirection: "column", zIndex: 100,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  markAllBtn: {
    background: "transparent", border: "none", color: "#1e40af",
    fontSize: 12, cursor: "pointer", padding: 0,
  },
  list: { overflowY: "auto", maxHeight: 420 },
  empty: { textAlign: "center", padding: "40px 20px", color: "rgba(0,0,0,0.4)" },
  item: {
    display: "flex", gap: 12, padding: "14px 20px",
    borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: "pointer",
    transition: "background 0.15s",
  },
  dotNew: {
    width: 6, height: 6, borderRadius: "50%", background: "#1e40af", flexShrink: 0,
  },
  msg: {
    fontSize: 13, color: "rgba(0,0,0,0.65)", lineHeight: 1.4,
    margin: 0, marginBottom: 4,
  },
  time: { fontSize: 11, color: "rgba(0,0,0,0.4)" },
  removeBtn: {
    background: "transparent", border: "none", color: "rgba(0,0,0,0.3)",
    cursor: "pointer", fontSize: 12, padding: 4, alignSelf: "flex-start",
  },
}