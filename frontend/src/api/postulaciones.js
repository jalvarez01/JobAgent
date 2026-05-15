import { apiFetch } from "./client"

const BASE = ""

export async function crearPostulacion(data) {
  return apiFetch(`${BASE}/postulaciones/`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listarPostulaciones(perfil_id) {
  return apiFetch(`${BASE}/postulaciones/perfil/${perfil_id}`)
}

export async function listarTodasPostulaciones() {
  return apiFetch(`${BASE}/postulaciones/`)
}

export async function obtenerPostulacion(id) {
  return apiFetch(`${BASE}/postulaciones/${id}`)
}

export async function cambiarEstado(id, estado, notas = null) {
  return apiFetch(`${BASE}/postulaciones/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado, notas }),
  })
}

export async function obtenerTrazas(perfil_id, limit = 50) {
  return apiFetch(`${BASE}/trazas/${perfil_id}?limit=${limit}`)
}

export async function ejecutarPipeline(perfil_id) {
  return apiFetch(`${BASE}/pipeline/ejecutar`, {
    method: "POST",
    body: JSON.stringify({ perfil_id }),
  })
}