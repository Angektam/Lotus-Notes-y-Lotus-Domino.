import { useState, useEffect } from 'react'
import api from '../api/axios'

const EVENT_TYPES = { meeting: 'Reunión', reminder: 'Recordatorio', appointment: 'Cita', event: 'Evento' }
const emptyForm = { title: '', description: '', startDate: '', endDate: '', location: '', eventType: 'meeting' }

function Calendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => { loadEvents() }, [])

  const loadEvents = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/calendar')
      setEvents(response.data.events || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingEvent(null)
    setFormData(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate ? event.startDate.slice(0, 16) : '',
      endDate: event.endDate ? event.endDate.slice(0, 16) : '',
      location: event.location || '',
      eventType: event.eventType || 'meeting'
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.title.trim()) { setFormError('El título es obligatorio'); return }
    if (!formData.startDate || !formData.endDate) { setFormError('Debes especificar fecha de inicio y fin'); return }
    if (new Date(formData.endDate) < new Date(formData.startDate)) { setFormError('La fecha de fin no puede ser anterior a la de inicio'); return }
    const durationHours = (new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60)
    if (durationHours > 720) { setFormError('El evento no puede durar más de 30 días'); return }

    try {
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent.id}`, formData)
        setSuccessMsg('Evento actualizado')
      } else {
        await api.post('/calendar', formData)
        setSuccessMsg('Evento creado')
      }
      setTimeout(() => setSuccessMsg(''), 3000)
      setShowForm(false)
      loadEvents()
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar el evento')
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      await api.delete(`/calendar/${id}`)
      loadEvents()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el evento')
    }
  }

  const filtered = filterType === 'all' ? events : events.filter(e => e.eventType === filterType)

  // Agrupar por fecha
  const grouped = filtered.reduce((acc, ev) => {
    const day = new Date(ev.startDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(ev)
    return acc
  }, {})

  const typeColors = { meeting: '#3498db', reminder: '#f39c12', appointment: '#9b59b6', event: '#27ae60' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Calendario</h1>
        <button className="btn btn-success" onClick={openCreate}>+ Nuevo Evento</button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {successMsg && <div className="success-message" style={{ marginBottom: '16px' }}>{successMsg}</div>}

      {/* Filtro por tipo */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'meeting', 'reminder', 'appointment', 'event'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`btn ${filterType === t ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              {t === 'all' ? 'Todos' : EVENT_TYPES[t]}
            </button>
          ))}
          <span style={{ fontSize: '13px', color: '#718096', alignSelf: 'center', marginLeft: '8px' }}>
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#718096' }}>Cargando eventos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '18px', color: '#718096' }}>No hay eventos para mostrar.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#555', fontSize: '15px', textTransform: 'capitalize', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              📅 {day}
            </h3>
            <div className="grid grid-2">
              {dayEvents.map((event) => (
                <div key={event.id} className="card" style={{ borderLeft: `4px solid ${typeColors[event.eventType] || '#ccc'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px' }}>{event.title}</h3>
                    <span style={{ fontSize: '12px', background: typeColors[event.eventType] || '#ccc', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
                      {EVENT_TYPES[event.eventType] || event.eventType}
                    </span>
                  </div>
                  {event.description && <p style={{ color: '#4a5568', marginBottom: '8px', fontSize: '14px' }}>{event.description}</p>}
                  <div style={{ fontSize: '13px', color: '#718096', marginBottom: '12px' }}>
                    <p>🕐 {new Date(event.startDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} — {new Date(event.endDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                    {event.location && <p>📍 {event.location}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" onClick={() => openEdit(event)}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={() => deleteEvent(event.id)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div className="error-message" style={{ marginBottom: '12px' }}>{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="review-section">
                  <label>Título *</label>
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="review-section">
                  <label>Descripción</label>
                  <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-2">
                  <div className="review-section">
                    <label>Inicio *</label>
                    <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                  </div>
                  <div className="review-section">
                    <label>Fin *</label>
                    <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                  </div>
                  <div className="review-section">
                    <label>Ubicación</label>
                    <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Opcional" />
                  </div>
                  <div className="review-section">
                    <label>Tipo</label>
                    <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                      <option value="meeting">Reunión</option>
                      <option value="reminder">Recordatorio</option>
                      <option value="appointment">Cita</option>
                      <option value="event">Evento</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: '16px 0 0' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingEvent ? 'Guardar cambios' : 'Crear Evento'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
