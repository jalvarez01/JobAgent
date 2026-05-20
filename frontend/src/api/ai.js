import { apiFetch } from "./client"

export async function obtenerRankingCandidatos(vacante_id) {
  return apiFetch(`/ai/ranking/${vacante_id}`)
}

export async function generarPreguntasEntrevista(perfil_id, vacante_id) {
  return apiFetch("/ai/entrevista/preguntas", {
    method: "POST",
    body: JSON.stringify({ perfil_id, vacante_id }),
  })
}

export async function generarMensajeInvitacion(payload) {
  // payload: { perfil_id, vacante_id, fecha?, modalidad?, duracion_minutos?, link_reunion?, nombre_entrevistador? }
  return apiFetch("/ai/entrevista/invitacion", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}