import { apiFetch } from "./client"

export async function crearPerfil(data) {
  return apiFetch("/perfiles/", {
    method: "POST",
    body: JSON.stringify(data),
  }, false)  // registro es público
}

export async function obtenerPerfil(perfilId) {
  return apiFetch(`/perfiles/${perfilId}`)
}

export async function actualizarPerfil(perfilId, data) {
  return apiFetch(`/perfiles/${perfilId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function listarPerfiles() {
  return apiFetch("/perfiles/")
}

// Lista pública para el panel admin (no requiere JWT de usuario).
export async function listarPerfilesAdmin() {
  return apiFetch("/perfiles/admin/listar", {}, false)
}

export async function analizarCVEstructurado(texto) {
  return apiFetch("/cv/analizar-estructurado", {
    method: "POST",
    body: JSON.stringify({ texto }),
  }, false)  // análisis de CV es público durante registro
}