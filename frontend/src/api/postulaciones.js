const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ─── Postulaciones ───

export async function crearPostulacion({ perfil_id, vacante_id, tipo = "manual", score_match = null }) {
  const res = await fetch(`${BASE_URL}/postulaciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfil_id, vacante_id, tipo, score_match }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function listarPostulaciones(perfilId) {
  const res = await fetch(`${BASE_URL}/postulaciones/perfil/${perfilId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function cambiarEstado(postulacionId, estado, notas = null) {
  const res = await fetch(`${BASE_URL}/postulaciones/${postulacionId}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, notas }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ─── Trazabilidad ───

export async function obtenerTrazas(perfilId, limit = 50) {
  const res = await fetch(`${BASE_URL}/trazas/${perfilId}?limit=${limit}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ─── Pipeline ───

export async function ejecutarPipeline(perfilId, cvTexto = "") {
  const res = await fetch(`${BASE_URL}/pipeline/ejecutar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfil_id: perfilId, cv_texto: cvTexto }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}
