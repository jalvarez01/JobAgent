const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function listarVacantes(query = "", area = "") {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (area) params.set("area", area)
  const qs = params.toString() ? `?${params.toString()}` : ""
  const res = await fetch(`${BASE_URL}/vacantes/${qs}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function obtenerVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/vacantes/${vacanteId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function obtenerRecomendaciones(perfilId, { limit = 10, modalidad, ubicacion, area } = {}) {
  const params = new URLSearchParams()
  params.set("limit", limit)
  if (modalidad) params.set("modalidad", modalidad)
  if (ubicacion) params.set("ubicacion", ubicacion)
  if (area) params.set("area", area)
  const res = await fetch(`${BASE_URL}/vacantes/recomendaciones/${perfilId}?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function listarAreas() {
  const res = await fetch(`${BASE_URL}/vacantes/areas`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ─── Admin CRUD ───

export async function listarTodasVacantes() {
  const res = await fetch(`${BASE_URL}/vacantes/?todas=true`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function crearVacante(data) {
  const res = await fetch(`${BASE_URL}/vacantes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function actualizarVacante(vacanteId, data) {
  const res = await fetch(`${BASE_URL}/vacantes/${vacanteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function eliminarVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/vacantes/${vacanteId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return true
}