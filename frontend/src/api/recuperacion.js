import { apiFetch } from "./client"

export async function solicitarRecuperacion(email) {
  return apiFetch("/auth/recuperar", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function validarTokenRecuperacion(token) {
  return apiFetch(`/auth/recuperar/validar/${token}`)
}

export async function cambiarPasswordConToken(token, nueva_password) {
  return apiFetch("/auth/recuperar/cambiar", {
    method: "POST",
    body: JSON.stringify({ token, nueva_password }),
  })
}