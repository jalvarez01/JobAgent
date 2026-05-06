const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.status === 204 ? true : res.json()
}

export async function listarEntrevistasPorPerfil(perfil_id) {
  return handle(await fetch(`${BASE_URL}/entrevistas/perfil/${perfil_id}`))
}

export async function listarTodasEntrevistas() {
  return handle(await fetch(`${BASE_URL}/entrevistas/`))
}

export async function crearEntrevista(data) {
  return handle(await fetch(`${BASE_URL}/entrevistas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }))
}

export async function actualizarEntrevista(entrevista_id, data) {
  return handle(await fetch(`${BASE_URL}/entrevistas/${entrevista_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }))
}

export async function eliminarEntrevista(entrevista_id) {
  return handle(await fetch(`${BASE_URL}/entrevistas/${entrevista_id}`, {
    method: "DELETE",
  }))
}