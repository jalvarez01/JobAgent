import { useState, useEffect } from "react"
import {
  listarTodasVacantes,
  crearVacante,
  actualizarVacante,
  eliminarVacante,
} from "../api/vacantes"

const MODALIDADES = [
  { value: "", label: "Seleccionar..." },
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
]

const ESTADOS = [
  { value: "activa", label: "Activa" },
  { value: "cerrada", label: "Cerrada" },
  { value: "pausada", label: "Pausada" },
]

const FORM_VACIO = {
  titulo: "",
  empresa: "",
  ubicacion: "",
  modalidad: "",
  salario_min: "",
  salario_max: "",
  descripcion: "",
  requisitos: "",
  url: "",
  estado: "activa",
}

export default function AdminVacantes({ onVolver }) {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState("lista") // "lista" | "form"
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarVacantes()
  }, [])

  const cargarVacantes = async () => {
    setLoading(true)
    try {
      const data = await listarTodasVacantes()
      setVacantes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNueva = () => {
    setForm({ ...FORM_VACIO })
    setEditandoId(null)
    setError("")
    setMensaje("")
    setVista("form")
  }

  const handleEditar = (vacante) => {
    setForm({
      titulo: vacante.titulo || "",
      empresa: vacante.empresa || "",
      ubicacion: vacante.ubicacion || "",
      modalidad: vacante.modalidad || "",
      salario_min: vacante.salario_min ?? "",
      salario_max: vacante.salario_max ?? "",
      descripcion: vacante.descripcion || "",
      requisitos: vacante.requisitos || "",
      url: vacante.url || "",
      estado: vacante.estado || "activa",
    })
    setEditandoId(vacante.id)
    setError("")
    setMensaje("")
    setVista("form")
  }

  const handleEliminar = async (id, titulo) => {
    if (!confirm(`¿Eliminar la vacante "${titulo}"? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarVacante(id)
      setMensaje("Vacante eliminada")
      await cargarVacantes()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMensaje("")

    const payload = {
      ...form,
      salario_min: form.salario_min !== "" ? Number(form.salario_min) : null,
      salario_max: form.salario_max !== "" ? Number(form.salario_max) : null,
      modalidad: form.modalidad || null,
      ubicacion: form.ubicacion || null,
      url: form.url || null,
    }

    try {
      if (editandoId) {
        await actualizarVacante(editandoId, payload)
        setMensaje("Vacante actualizada correctamente")
      } else {
        await crearVacante(payload)
        setMensaje("Vacante creada correctamente")
      }
      await cargarVacantes()
      setVista("lista")
    } catch (err) {
      setError(err.message)
    }
  }

  const vacantesFiltradas = busqueda
    ? vacantes.filter(
        (v) =>
          v.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
          (v.requisitos || "").toLowerCase().includes(busqueda.toLowerCase())
      )
    : vacantes

  const formatSalario = (min, max) => {
    if (!min && !max) return "—"
    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `Desde ${fmt(min)}`
    return `Hasta ${fmt(max)}`
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Admin - Vacantes</h2>
          <p style={styles.subtitle}>{vacantes.length} vacantes registradas</p>
        </div>
        <div style={styles.headerActions}>
          {vista === "lista" && (
            <button onClick={handleNueva} style={styles.btnPrimario}>
              + Nueva vacante
            </button>
          )}
          <button onClick={onVolver} style={styles.btnSecundario}>
            ← Volver
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {mensaje && <p style={styles.success}>{mensaje}</p>}

      {/* ========== LISTA ========== */}
      {vista === "lista" && (
        <div>
          <input
            type="text"
            placeholder="Buscar por título, empresa o requisitos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />

          {loading ? (
            <p style={{ textAlign: "center", color: "#999", padding: 40 }}>
              Cargando vacantes...
            </p>
          ) : vacantesFiltradas.length === 0 ? (
            <div style={styles.empty}>
              <p>No hay vacantes{busqueda ? " que coincidan con la búsqueda" : ""}.</p>
              <button onClick={handleNueva} style={styles.btnPrimario}>
                Crear la primera vacante
              </button>
            </div>
          ) : (
            <div style={styles.tabla}>
              <div style={styles.tablaHeader}>
                <span style={{ flex: 2 }}>Título / Empresa</span>
                <span style={{ flex: 1 }}>Ubicación</span>
                <span style={{ flex: 1 }}>Modalidad</span>
                <span style={{ flex: 1 }}>Salario</span>
                <span style={{ flex: 1 }}>Estado</span>
                <span style={{ width: 120, textAlign: "right" }}>Acciones</span>
              </div>
              {vacantesFiltradas.map((v) => (
                <div key={v.id} style={styles.tablaRow}>
                  <span style={{ flex: 2 }}>
                    <strong style={{ fontSize: 14, color: "#111827" }}>{v.titulo}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{v.empresa}</span>
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: "#4b5563" }}>
                    {v.ubicacion || "—"}
                  </span>
                  <span style={{ flex: 1 }}>
                    {v.modalidad ? (
                      <span style={styles.modTag}>{v.modalidad}</span>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: "#4b5563" }}>
                    {formatSalario(v.salario_min, v.salario_max)}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span
                      style={{
                        ...styles.estadoTag,
                        background: v.estado === "activa" ? "#d1fae5" : "#fee2e2",
                        color: v.estado === "activa" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {v.estado}
                    </span>
                  </span>
                  <span style={{ width: 120, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleEditar(v)}
                      style={styles.btnMini}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(v.id, v.titulo)}
                      style={styles.btnMiniDanger}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== FORMULARIO ========== */}
      {vista === "form" && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ margin: "0 0 16px" }}>
            {editandoId ? "Editar vacante" : "Nueva vacante"}
          </h3>

          <div style={styles.grid}>
            <label style={styles.label}>
              Título del cargo *
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Desarrollador Backend Python"
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Empresa *
              <input
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                required
                placeholder="Ej: Rappi"
                style={styles.input}
              />
            </label>
          </div>

          <div style={styles.grid}>
            <label style={styles.label}>
              Ubicación
              <input
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Medellín"
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Modalidad
              <select
                name="modalidad"
                value={form.modalidad}
                onChange={handleChange}
                style={styles.input}
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.grid}>
            <label style={styles.label}>
              Salario mínimo (COP)
              <input
                name="salario_min"
                type="number"
                min="0"
                value={form.salario_min}
                onChange={handleChange}
                placeholder="Ej: 4000000"
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Salario máximo (COP)
              <input
                name="salario_max"
                type="number"
                min="0"
                value={form.salario_max}
                onChange={handleChange}
                placeholder="Ej: 7000000"
                style={styles.input}
              />
            </label>
          </div>

          <label style={styles.label}>
            Descripción del cargo
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Describe las responsabilidades y el contexto del puesto..."
              style={{ ...styles.input, resize: "vertical" }}
            />
          </label>

          <label style={styles.label}>
            Requisitos / Skills
            <input
              name="requisitos"
              value={form.requisitos}
              onChange={handleChange}
              placeholder="Separados por ; → Ej: python;fastapi;postgresql;docker"
              style={styles.input}
            />
            <span style={styles.hint}>
              Separa cada skill con punto y coma (;). Estos se usan para el matching con candidatos.
            </span>
          </label>

          {/* Preview de skills */}
          {form.requisitos && (
            <div style={styles.skillsPreview}>
              {form.requisitos.split(";").filter(s => s.trim()).map((s) => (
                <span key={s.trim()} style={styles.skillTag}>{s.trim()}</span>
              ))}
            </div>
          )}

          <div style={styles.grid}>
            <label style={styles.label}>
              URL de la oferta
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://..."
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Estado
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                style={styles.input}
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => { setVista("lista"); setError(""); setMensaje(""); }}
              style={styles.btnSecundario}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.btnPrimario}>
              {editandoId ? "Guardar cambios" : "Crear vacante"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 900, margin: "0 auto", padding: "24px 16px", textAlign: "left" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 },
  subtitle: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  headerActions: { display: "flex", gap: 8 },
  error: { color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 14 },
  success: { color: "#065f46", background: "#d1fae5", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 14 },
  searchInput: {
    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8,
    fontSize: 14, marginBottom: 16, boxSizing: "border-box",
  },
  empty: { textAlign: "center", padding: 40, color: "#6b7280" },
  tabla: { border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" },
  tablaHeader: {
    display: "flex", alignItems: "center", padding: "10px 14px", background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", gap: 10,
  },
  tablaRow: {
    display: "flex", alignItems: "center", padding: "12px 14px",
    borderBottom: "1px solid #f3f4f6", gap: 10,
  },
  modTag: {
    fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#1d4ed8",
  },
  estadoTag: {
    fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
  },
  btnPrimario: {
    padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none",
    borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500,
  },
  btnSecundario: {
    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
    borderRadius: 6, cursor: "pointer", fontSize: 13,
  },
  btnMini: {
    fontSize: 12, padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8",
    border: "none", borderRadius: 4, cursor: "pointer",
  },
  btnMiniDanger: {
    fontSize: 12, padding: "4px 10px", background: "#fef2f2", color: "#dc2626",
    border: "none", borderRadius: 4, cursor: "pointer",
  },
  form: { border: "1px solid #e5e7eb", borderRadius: 10, padding: 24, background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  label: {
    display: "flex", flexDirection: "column", gap: 4, fontSize: 14, fontWeight: 500,
    color: "#374151", marginBottom: 4,
  },
  input: {
    padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6,
    fontSize: 14, fontWeight: 400, width: "100%", boxSizing: "border-box",
  },
  hint: { fontSize: 12, color: "#9ca3af", fontWeight: 400 },
  skillsPreview: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 },
  skillTag: {
    fontSize: 12, color: "#1d4ed8", background: "#eff6ff", padding: "3px 10px", borderRadius: 12,
  },
  formActions: { display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" },
}