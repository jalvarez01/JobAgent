import { useState, useEffect, useRef } from "react"
import {
  listarNotificaciones, contarNoLeidas,
  marcarLeida, marcarTodasLeidas, eliminarNotificacion,
} from "../api/notificaciones"

const COLORS = {
  cambio_estado: "var(--info)",
  entrevista_programada: "#7c3aed",
  entrevista_calificada: "var(--warning)",
  sistema: "var(--foreground)",
}

const COLOR_BGS = {
  cambio_estado: "var(--info-bg)",
  entrevista_programada: "rgba(124, 58, 237, 0.1)",
  entrevista_calificada: "var(--warning-bg)",
  sistema: "rgba(0,0,0,0.04)",
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
          color: abierto || noLeidas > 0 ? "var(--foreground)" : "var(--muted-foreground)",
          fontWeight: noLeidas > 0 ? 500 : 400,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
        onMouseLeave={(e) => {
          if (!abierto && noLeidas === 0) {
            e.currentTarget.style.color = "var(--muted-foreground)"
          }
        }}
        aria-label={`Notificaciones${noLeidas > 0 ? ` (${noLeidas} sin leer)` : ""}`}
      >
        Notificaciones
        {noLeidas > 0 && (
          <span style={s.badge}>{noLeidas > 9 ? "9+" : noLeidas}</span>
        )}
      </button>

      {abierto && (
        <div style={s.dropdown} className="animate-fade-in">
          <div style={s.header}>
            <h3 style={s.headerTitle}>Notificaciones</h3>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                style={s.markAllBtn}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div style={s.list}>
            {loading ? (
              <div style={s.emptyState}>
                <div style={s.spinner} />
              </div>
            ) : notificaciones.length === 0 ? (
              <div style={s.emptyState}>
                <p style={s.emptyText}>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotif(notif)}
                  style={{
                    ...s.item,
                    background: notif.leida ? "transparent" : "var(--accent)",
                  }}
                  onMouseEnter={(e) => {
                    if (notif.leida) e.currentTarget.style.background = "rgba(0,0,0,0.025)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notif.leida ? "transparent" : "var(--accent)"
                  }}
                >
                  <div style={{
                    ...s.iconCircle,
                    background: COLOR_BGS[notif.tipo] || COLOR_BGS.sistema,
                    color: COLORS[notif.tipo] || COLORS.sistema,
                  }}>
                    {!notif.leida && <span style={s.dotNew} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.itemTitle}>{notif.titulo}</div>
                    <p style={s.itemMsg}>{notif.mensaje}</p>
                    <span style={s.itemTime}>{fmtFecha(notif.created_at)}</span>
                  </div>
                  <button
                    onClick={(e) => handleEliminar(e, notif.id)}
                    style={s.removeBtn}
                    aria-label="Eliminar"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.06)"
                      e.currentTarget.style.color = "var(--foreground)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "var(--muted-foreground)"
                    }}
                  >
                    ×
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
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    padding: "4px 0",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "inherit",
    transition: "color 0.2s",
    letterSpacing: "0.01em",
  },
  badge: {
    minWidth: 18,
    height: 18,
    background: "var(--destructive)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
    lineHeight: 1,
  },
  dropdown: {
    position: "absolute",
    top: 32,
    right: 0,
    width: 400,
    maxHeight: 520,
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 22px",
    borderBottom: "1px solid var(--border)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "var(--foreground)",
  },
  markAllBtn: {
    background: "transparent",
    border: "none",
    color: "var(--primary)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
    transition: "opacity 0.2s",
  },
  list: {
    overflowY: "auto",
    maxHeight: 440,
  },
  emptyState: {
    padding: "48px 20px",
    textAlign: "center",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "2.5px solid var(--border)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  },
  emptyText: {
    fontSize: 14,
    color: "var(--muted-foreground)",
  },
  item: {
    display: "flex",
    gap: 14,
    padding: "16px 22px",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  dotNew: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--primary)",
    boxShadow: "0 0 0 2px var(--background)",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 4,
    letterSpacing: "-0.005em",
    lineHeight: 1.3,
  },
  itemMsg: {
    fontSize: 13,
    color: "var(--muted-foreground)",
    lineHeight: 1.45,
    margin: 0,
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    opacity: 0.7,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "flex-start",
    transition: "all 0.2s",
  },
}