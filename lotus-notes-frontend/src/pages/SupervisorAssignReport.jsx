import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const emptyForm = { brigadistaId: '', title: '', description: '', dueDate: '', periodStart: '', periodEnd: '' }
const today = new Date().toISOString().split('T')[0]

function SupervisorAssignReport() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [parsedExtra, setParsedExtra] = useState(null) // datos extra del doc
  const fileRef = useRef()

  useEffect(() => { loadBrigadistas() }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch (error) {
      setFormError('No se pudieron cargar los brigadistas')
    } finally {
      setLoading(false)
    }
  }

  const handleDocUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/pdf']
    if (!allowed.includes(file.type) && !file.name.match(/\.(docx|doc|pdf)$/i)) {
      setFormError('Solo se aceptan archivos DOCX, DOC o PDF')
      fileRef.current.value = ''
      return
    }

    setParsing(true)
    setFormError('')
    try {
      const fd = new FormData()
      fd.append('document', file)
      const res = await api.post('/supervisor/parse-report', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const d = res.data.data

      // Pre-llenar el formulario con los datos extraídos
      setForm(prev => ({
        ...prev,
        title: d.title || prev.title,
        description: d.description || prev.description,
        periodStart: d.periodStart || prev.periodStart,
        periodEnd: d.periodEnd || prev.periodEnd,
        // Si el nombre del brigadista coincide con alguno, seleccionarlo
        brigadistaId: prev.brigadistaId || matchBrigadista(d.nombreBrigadista)
      }))

      setParsedExtra(d)
      setSuccessMsg('Documento procesado. Revisa y completa los campos.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al procesar el documento')
    } finally {
      setParsing(false)
      fileRef.current.value = ''
    }
  }

  const matchBrigadista = (nombre) => {
    if (!nombre) return ''
    const n = nombre.toLowerCase()
    const found = brigadistas.find(b =>
      (b.fullName || '').toLowerCase().includes(n) ||
      n.includes((b.fullName || '').toLowerCase())
    )
    return found ? String(found.id) : ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')

    if (!form.brigadistaId) { setFormError('Selecciona un brigadista'); return }
    if (!form.title.trim()) { setFormError('El título es obligatorio'); return }
    if (!form.dueDate) { setFormError('La fecha límite es obligatoria'); return }
    if (form.dueDate < today) { setFormError('La fecha límite no puede ser en el pasado'); return }
    if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
      setFormError('La fecha de fin del período no puede ser anterior al inicio'); return
    }

    setSubmitting(true)
    try {
      await api.post('/supervisor/reports/assign', { ...form, brigadistaId: Number(form.brigadistaId) })
      setSuccessMsg('Reporte asignado exitosamente')
      setForm(emptyForm)
      setParsedExtra(null)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (error) {
      setFormError(error.response?.data?.message || error.response?.data?.error || 'Error al asignar reporte')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📌 Asignar reporte</h1>
        <p className="subtitle">Crea un reporte y asígnalo a un brigadista</p>
      </div>

      {formError && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {formError}
          <button onClick={() => setFormError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {successMsg && <div className="success-message" style={{ marginBottom: 16 }}>{successMsg}</div>}

      {/* Zona de carga de documento */}
      <div className="card" style={{ marginBottom: 20, background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: 15 }}>
              📄 Importar desde documento
            </p>
            <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>
              Sube un DOCX o PDF con el formato del informe y se pre-llenará el formulario automáticamente.
            </p>
          </div>
          <label className={`btn btn-outline ${parsing ? 'disabled' : ''}`} style={{ cursor: parsing ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            {parsing ? '⏳ Procesando...' : '📂 Subir documento'}
            <input
              ref={fileRef}
              type="file"
              accept=".docx,.doc,.pdf"
              onChange={handleDocUpload}
              disabled={parsing}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Vista previa de datos extraídos */}
        {parsedExtra && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: '#374151' }}>
              ✅ Datos extraídos del documento:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, fontSize: 13 }}>
              {parsedExtra.nombreBrigadista && <div><span style={{ color: '#718096' }}>Brigadista:</span> <strong>{parsedExtra.nombreBrigadista}</strong></div>}
              {parsedExtra.unidadAcademica && <div><span style={{ color: '#718096' }}>Unidad Académica:</span> <strong>{parsedExtra.unidadAcademica}</strong></div>}
              {parsedExtra.licenciatura && <div><span style={{ color: '#718096' }}>Licenciatura:</span> <strong>{parsedExtra.licenciatura}</strong></div>}
              {parsedExtra.numeroCuenta && <div><span style={{ color: '#718096' }}>No. Cuenta:</span> <strong>{parsedExtra.numeroCuenta}</strong></div>}
              {parsedExtra.unidadReceptora && <div><span style={{ color: '#718096' }}>Unidad Receptora:</span> <strong>{parsedExtra.unidadReceptora}</strong></div>}
              {parsedExtra.proyecto && <div><span style={{ color: '#718096' }}>Proyecto:</span> <strong>{parsedExtra.proyecto}</strong></div>}
              {parsedExtra.numInforme && <div><span style={{ color: '#718096' }}>No. Informe:</span> <strong>{parsedExtra.numInforme}</strong></div>}
              {parsedExtra.horas > 0 && <div><span style={{ color: '#718096' }}>Horas:</span> <strong>{parsedExtra.horas}</strong></div>}
              {parsedExtra.lugar && <div><span style={{ color: '#718096' }}>Lugar:</span> <strong>{parsedExtra.lugar}</strong></div>}
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="card">
        <form onSubmit={submit} className="grid grid-2">
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Brigadista *</label>
            <select value={form.brigadistaId} onChange={(e) => setForm({ ...form, brigadistaId: e.target.value })} required>
              <option value="">Selecciona un brigadista...</option>
              {brigadistas.map(b => (
                <option key={b.id} value={b.id}>
                  {b.fullName || b.username} ({b.username})
                  {b.brigadistaProfile?.community ? ` — ${b.brigadistaProfile.community}` : ''}
                  {b.brigadistaProfile?.zone ? ` / ${b.brigadistaProfile.zone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Título *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Informe de Servicio Social No. 4" required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Descripción / Instrucciones</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instrucciones, alcance, resultados esperados..." rows={5} />
          </div>

          <div>
            <label>Inicio del período</label>
            <input type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
          </div>
          <div>
            <label>Fin del período</label>
            <input type="date" value={form.periodEnd} min={form.periodStart || undefined} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Fecha límite de entrega *</label>
            <input type="date" value={form.dueDate} min={today} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {parsedExtra && (
              <button type="button" className="btn btn-secondary" onClick={() => { setForm(emptyForm); setParsedExtra(null) }}>
                Limpiar
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting || loading}>
              {submitting ? 'Asignando...' : 'Asignar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupervisorAssignReport
