const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function parseError(err, status) {
  // FastAPI 422 returns { detail: [ { loc: [...], msg: "..." }, ... ] }
  if (Array.isArray(err.detail)) {
    const campos = err.detail.map((e) => {
      const campo = e.loc?.[e.loc.length - 1] || "campo"
      return `${campo}: ${e.msg}`
    })
    return campos.join(". ")
  }
  // Normal error string
  if (typeof err.detail === "string") {
    return err.detail
  }
  // Fallback
  return `Error ${status}: No se pudo completar la solicitud`
}

export async function crearPerfil(data) {
  const res = await fetch(`${BASE_URL}/perfiles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  return res.json()
}

export async function obtenerPerfil(perfilId) {
  const res = await fetch(`${BASE_URL}/perfiles/${perfilId}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  return res.json()
}

export async function actualizarPerfil(perfilId, data) {
  const res = await fetch(`${BASE_URL}/perfiles/${perfilId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  return res.json()
}

export async function listarPerfiles() {
  const res = await fetch(`${BASE_URL}/perfiles/`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  return res.json()
}

export async function analizarCVEstructurado(texto) {
  const res = await fetch(`${BASE_URL}/cv/analizar-estructurado`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  return res.json()
}