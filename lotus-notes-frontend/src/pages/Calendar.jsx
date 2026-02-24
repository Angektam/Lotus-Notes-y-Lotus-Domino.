import { useState, useEffect } from 'react'
import api from '../api/axios'

function Calendar() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    eventType: 'meeting'
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await api.get('/calendar')
      setEvents(response.data.events)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/calendar', formData)
      setFormData({ title: '', description: '', startDate: '', endDate: '', location: '', eventType: 'meeting' })
      setShowForm(false)
      loadEvents()
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const deleteEvent = async (id) => {
    if (confirm('¿Eliminar este evento?')) {
      try {
        await api.delete(`/calendar/${id}`)
        loadEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Calendario</h1>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Evento'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Crear Nuevo Evento</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Descripción"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <label>Fecha y hora de inicio</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <label>Fecha y hora de fin</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Ubicación"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="meeting">Reunión</option>
              <option value="reminder">Recordatorio</option>
              <option value="appointment">Cita</option>
              <option value="event">Evento</option>
            </select>
            <button type="submit" className="btn btn-primary">Crear Evento</button>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {events.map((event) => (
          <div key={event.id} className="card">
            <h3>{event.title}</h3>
            <p style={{ color: '#4a5568', marginBottom: '12px' }}>{event.description}</p>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
              <p>Inicio: {new Date(event.startDate).toLocaleString()}</p>
              <p>Fin: {new Date(event.endDate).toLocaleString()}</p>
              {event.location && <p>Ubicación: {event.location}</p>}
              <p>Tipo: {event.eventType}</p>
            </div>
            <button className="btn btn-danger" onClick={() => deleteEvent(event.id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {events.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '18px', color: '#718096' }}>No tienes eventos programados.</p>
        </div>
      )}
    </div>
  )
}

export default Calendar
