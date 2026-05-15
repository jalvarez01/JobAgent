import { apiFetch } from "./client"

export async function guardarFavorito(perfil_id, vacante_id) {
  return apiFetch("/favoritos/", {
    method: "POST",
    body: JSON.stringify({ perfil_id, vacante_id }),
  })
}

export async function listarFavoritos(perfil_id) {
  return apiFetch(`/favoritos/perfil/${perfil_id}`)
}

export async function esFavorito(perfil_id, vacante_id) {
  try {
    return await apiFetch(`/favoritos/check/${perfil_id}/${vacante_id}`)
  } catch {
    return { es_favorito: false }
  }
}

export async function eliminarFavorito(perfil_id, vacante_id) {
  return apiFetch(`/favoritos/${perfil_id}/${vacante_id}`, { method: "DELETE" })
}