import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const emptyForm = { brigadistaId: '', title: '', description: '', dueDate: '', periodStart: '', periodEnd: '' }
const today = new Date().toISOString().split('T')[0]

function SupervisorAssignReport() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { loadBrigadistas() }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar brigadistas:', error)
      setFormError('No se pudieron cargar los brigadistas')
    } finally {
      setLoading(false)
    }
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
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. Reporte de inspección semanal" required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instrucciones / alcance del reporte..." rows={4} />
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

