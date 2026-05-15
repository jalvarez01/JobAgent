import { apiFetch } from "./client"

export async function analizarBrechas(perfil_id) {
  return apiFetch(`/brechas/${perfil_id}`)
}

export async function listarSkillsAprendizaje(perfil_id) {
  return apiFetch(`/brechas/${perfil_id}/aprendizaje`)
}

export async function agregarSkillAprendizaje(perfil_id, skill) {
  return apiFetch(`/brechas/${perfil_id}/aprendizaje`, {
    method: "POST",
    body: JSON.stringify({ skill }),
  })
}

export async function eliminarSkillAprendizaje(perfil_id, skill) {
  return apiFetch(`/brechas/${perfil_id}/aprendizaje/${encodeURIComponent(skill)}`, {
    method: "DELETE",
  })
}