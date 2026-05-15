import { apiFetch } from "./client"

export async function obtenerDashboardResumen() {
  return apiFetch("/dashboard/")
}

export async function obtenerMetricasGenerales() {
  return apiFetch("/dashboard/metricas")
}

export async function obtenerTopSkillsDemandados(limit = 10) {
  return apiFetch(`/dashboard/skills/demandados?limit=${limit}`)
}

export async function obtenerTopSkillsCandidatos(limit = 10) {
  return apiFetch(`/dashboard/skills/candidatos?limit=${limit}`)
}

export async function obtenerVacantesPopulares(limit = 5) {
  return apiFetch(`/dashboard/vacantes/populares?limit=${limit}`)
}

export async function obtenerDistribucionEducativa() {
  return apiFetch("/dashboard/distribucion-educativa")
}

export async function obtenerTasaMatch() {
  return apiFetch("/dashboard/tasa-match")
}