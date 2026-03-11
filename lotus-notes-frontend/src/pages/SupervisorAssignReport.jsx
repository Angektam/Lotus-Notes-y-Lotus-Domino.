import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

function SupervisorAssignReport() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    brigadistaId: '',
    title: '',
    description: '',
    dueDate: '',
    periodStart: '',
    periodEnd: ''
  })

  useEffect(() => {
    loadBrigadistas()
  }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar brigadistas:', error)
      alert('No se pudieron cargar brigadistas')
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/supervisor/reports/assign', {
        ...form,
        brigadistaId: Number(form.brigadistaId)
      })
      alert('Reporte asignado exitosamente')
      setForm({
        brigadistaId: '',
        title: '',
        description: '',
        dueDate: '',
        periodStart: '',
        periodEnd: ''
      })
    } catch (error) {
      console.error('Error al asignar reporte:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al asignar reporte')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📌 Asignar reporte</h1>
        <p className="subtitle">Crea un reporte y asígnalo a un brigadista</p>
      </div>

      <div className="card">
        <form onSubmit={submit} className="grid grid-2">
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Brigadista</label>
            <select
              value={form.brigadistaId}
              onChange={(e) => setForm({ ...form, brigadistaId: e.target.value })}
              required
            >
              <option value="">Selecciona un brigadista...</option>
              {brigadistas.map(b => (
                <option key={b.id} value={b.id}>
                  {b.fullName || b.username} ({b.username}) {b.brigadistaProfile?.zone ? `- ${b.brigadistaProfile.zone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Título</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Reporte de inspección semanal"
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instrucciones / alcance del reporte..."
              rows={4}
            />
          </div>

          <div>
            <label>Fecha de inicio del periodo</label>
            <input
              type="date"
              value={form.periodStart}
              onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
            />
          </div>
          <div>
            <label>Fecha de fin del periodo</label>
            <input
              type="date"
              value={form.periodEnd}
              onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Fecha límite de entrega</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Asignar reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupervisorAssignReport

