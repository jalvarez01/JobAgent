const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function uploadCV(file) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${BASE_URL}/cv/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res.json()
}

export async function analizarCV(texto) {
  const res = await fetch(`${BASE_URL}/cv/analizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texto }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res.json()
}