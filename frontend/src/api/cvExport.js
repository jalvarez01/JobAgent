const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function validarPerfilParaCV(perfil_id) {
  const res = await fetch(`${BASE}/cv/exportar/${perfil_id}/validar`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error desconocido" }))
    throw new Error(err.detail || "No se pudo validar el perfil")
  }
  return res.json()
}

export async function descargarCVPDF(perfil_id) {
  const res = await fetch(`${BASE}/cv/exportar/${perfil_id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error generando PDF" }))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  // Obtener nombre del archivo desde Content-Disposition
  const disposition = res.headers.get("Content-Disposition") || ""
  let filename = "CV.pdf"
  const match = /filename="?([^"]+)"?/.exec(disposition)
  if (match && match[1]) {
    try {
      filename = decodeURIComponent(match[1])
    } catch {
      filename = match[1]
    }
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)

  // Disparar descarga automática
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Limpiar el blob URL después de un instante
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)

  return { filename }
}