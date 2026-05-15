/**
 * Cliente HTTP centralizado que inyecta el token JWT en cada petición autenticada.
 * Lee el token desde localStorage (clave 'jobagent_session').
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function getToken() {
  try {
    const saved = localStorage.getItem("jobagent_session")
    if (!saved) return null
    const session = JSON.parse(saved)
    return session.access_token || null
  } catch {
    return null
  }
}

function parseError(err, status) {
  if (Array.isArray(err.detail)) {
    return err.detail.map((e) => {
      const campo = e.loc?.[e.loc.length - 1] || "campo"
      return `${campo}: ${e.msg}`
    }).join(". ")
  }
  if (typeof err.detail === "string") return err.detail
  return `Error ${status}`
}

/**
 * Realiza una petición HTTP con el token JWT inyectado automáticamente
 * (si requiresAuth=true). Maneja errores 401 limpiando la sesión.
 */
export async function apiFetch(path, options = {}, requiresAuth = true) {
  const headers = { ...(options.headers || {}) }

  // Inyectar Content-Type si hay body JSON
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  // Inyectar Authorization si requiere autenticación
  if (requiresAuth) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Manejo especial de 401: token expirado o inválido
  if (res.status === 401) {
    localStorage.removeItem("jobagent_session")
    const err = await res.json().catch(() => ({}))
    // Recargar para forzar login
    if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/admin")) {
      window.location.href = "/"
    }
    throw new Error(err.detail || "Sesión expirada. Inicia sesión nuevamente.")
  }

  if (res.status === 403) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "No tienes permiso para realizar esta acción.")
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseError(err, res.status))
  }

  if (res.status === 204) return true
  return res.json()
}

export { BASE_URL }