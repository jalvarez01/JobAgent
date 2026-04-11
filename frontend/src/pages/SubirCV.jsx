import { useState } from "react"
import { uploadCV, analizarCV } from "../api/cv"

function SubirCV() {
  const [file, setFile] = useState(null)
  const [texto, setTexto] = useState("")
  const [resultado, setResultado] = useState("")
  const [error, setError] = useState("")
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingAnalizar, setLoadingAnalizar] = useState(false)

  const handleUpload = async () => {
    if (!file || loadingUpload) return
    setError("")
    setLoadingUpload(true)
    try {
      const res = await uploadCV(file)
      setTexto(res.texto)
      alert("Documento cargado")
    } catch (err) {
      setError(err.message || "Error al subir el documento")
    } finally {
      setLoadingUpload(false)
    }
  }

  const handleAnalizar = async () => {
    if (!texto.trim() || loadingAnalizar) return
    setError("")
    setLoadingAnalizar(true)
    try {
      const res = await analizarCV(texto)
      setResultado(res.resultado)
    } catch (err) {
      setError(err.message || "Error al analizar el documento")
    } finally {
      setLoadingAnalizar(false)
    }
  }

  return (
    <div>
      <h1>💼 JobAgent</h1>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={!file || loadingUpload}>
        {loadingUpload ? "Subiendo..." : "Subir"}
      </button>

      <button onClick={handleAnalizar} disabled={!texto.trim() || loadingAnalizar}>
        {loadingAnalizar ? "Analizando..." : "Analizar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultado && <pre>{resultado}</pre>}
    </div>
  )
}

export default SubirCV