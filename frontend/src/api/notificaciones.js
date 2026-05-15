import { apiFetch } from "./client"

export async function listarNotificaciones(perfil_id, soloNoLeidas = false) {
  const q = soloNoLeidas ? "?solo_no_leidas=true" : ""
  return apiFetch(`/notificaciones/perfil/${perfil_id}${q}`)
}

export async function contarNoLeidas(perfil_id) {
  return apiFetch(`/notificaciones/perfil/${perfil_id}/count`)
}

export async function marcarLeida(notificacion_id) {
  return apiFetch(`/notificaciones/${notificacion_id}/leer`, { method: "PATCH" })
}

export async function marcarTodasLeidas(perfil_id) {
  return apiFetch(`/notificaciones/perfil/${perfil_id}/leer-todas`, { method: "PATCH" })
}

export async function eliminarNotificacion(notificacion_id) {
  return apiFetch(`/notificaciones/${notificacion_id}`, { method: "DELETE" })
}