const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function guardarFavorito(perfil_id, vacante_id) {
  const res = await fetch(`${BASE_URL}/favoritos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfil_id, vacante_id }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function listarFavoritos(perfil_id) {
  const res = await fetch(`${BASE_URL}/favoritos/perfil/${perfil_id}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function esFavorito(perfil_id, vacante_id) {
  const res = await fetch(`${BASE_URL}/favoritos/check/${perfil_id}/${vacante_id}`)

  if (!res.ok) {
    return { es_favorito: false }
  }
  return res.json()
}

export async function eliminarFavorito(perfil_id, vacante_id) {
  const res = await fetch(`${BASE_URL}/favoritos/${perfil_id}/${vacante_id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return true
}