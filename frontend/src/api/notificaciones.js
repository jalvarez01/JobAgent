const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.status === 204 ? true : res.json()
}

export async function listarNotificaciones(perfil_id, soloNoLeidas = false) {
  const url = `${BASE_URL}/notificaciones/perfil/${perfil_id}${soloNoLeidas ? "?solo_no_leidas=true" : ""}`
  return handle(await fetch(url))
}

export async function contarNoLeidas(perfil_id) {
  return handle(await fetch(`${BASE_URL}/notificaciones/perfil/${perfil_id}/count`))
}

export async function marcarLeida(notificacion_id) {
  return handle(await fetch(`${BASE_URL}/notificaciones/${notificacion_id}/leer`, {
    method: "PATCH",
  }))
}

export async function marcarTodasLeidas(perfil_id) {
  return handle(await fetch(`${BASE_URL}/notificaciones/perfil/${perfil_id}/leer-todas`, {
    method: "PATCH",
  }))
}

export async function eliminarNotificacion(notificacion_id) {
  return handle(await fetch(`${BASE_URL}/notificaciones/${notificacion_id}`, {
    method: "DELETE",
  }))
}