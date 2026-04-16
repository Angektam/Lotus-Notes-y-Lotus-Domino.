import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'

const EVENT_TYPES = { meeting: 'Reunion', reminder: 'Recordatorio', appointment: 'Cita', event: 'Evento' }
const TYPE_COLORS = { meeting: '#3498db', reminder: '#f39c12', appointment: '#9b59b6', event: '#27ae60' }
const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
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
  const [view, setView] = useState('month')
  const [filterType, setFilterType] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { loadEvents() }, [])

  const loadEvents = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/calendar')
      setEvents(res.data.events || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar los eventos.')
    } finally { setLoading(false) }
  }

  const openCreate = (dateStr = '') => {
    setEditingEvent(null)
    setFormData({ ...emptyForm, startDate: dateStr ? dateStr + 'T08:00' : '', endDate: dateStr ? dateStr + 'T09:00' : '' })
    setFormError(''); setShowForm(true)
  }

  const openEdit = (ev) => {
    setEditingEvent(ev)
    setFormData({ title: ev.title, description: ev.description || '', startDate: ev.startDate ? ev.startDate.slice(0, 16) : '', endDate: ev.endDate ? ev.endDate.slice(0, 16) : '', location: ev.location || '', eventType: ev.eventType || 'meeting' })
    setFormError(''); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('')
    if (!formData.title.trim()) { setFormError('El titulo es obligatorio'); return }
    if (!formData.startDate || !formData.endDate) { setFormError('Debes especificar fecha de inicio y fin'); return }
    if (new Date(formData.endDate) < new Date(formData.startDate)) { setFormError('La fecha de fin no puede ser anterior al inicio'); return }
    try {
      if (editingEvent) { await api.put('/calendar/' + editingEvent.id, formData); setSuccessMsg('Evento actualizado') }
      else { await api.post('/calendar', formData); setSuccessMsg('Evento creado') }
      setTimeout(() => setSuccessMsg(''), 3000); setShowForm(false); loadEvents()
    } catch (err) { setFormError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar') }
  }

  const deleteEvent = async (id) => {
    try {
      await api.delete('/calendar/' + id)
      setEvents(prev => prev.filter(e => e.id !== id))
      setConfirmDelete(null); setSelectedDay(null)
    } catch (err) { setError(err.response?.data?.message || 'Error al eliminar'); setConfirmDelete(null) }
  }

  const filtered = useMemo(() => filterType === 'all' ? events : events.filter(e => e.eventType === filterType), [events, filterType])

  const eventsThisMonth = useMemo(() => filtered.filter(e => {
    const d = new Date(e.startDate)
    return d.getFullYear() === calYear && d.getMonth() === calMonth
  }), [filtered, calYear, calMonth])

  const calGrid = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [calYear, calMonth])

  const eventsForDay = (day) => {
    if (!day) return []
    const ds = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    return eventsThisMonth.filter(e => e.startDate.startsWith(ds))
  }

  const isToday = (day) => day && today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1); setSelectedDay(null) }
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1); setSelectedDay(null) }

  const grouped = useMemo(() => filtered.reduce((acc, ev) => {
    const day = new Date(ev.startDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    if (!acc[day]) acc[day] = []; acc[day].push(ev); return acc
  }, {}), [filtered])

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : []
  const selectedDateStr = selectedDay ? calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(selectedDay).padStart(2, '0') : ''

  const EventCard = ({ ev }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: '#f9fafb', borderLeft: '4px solid ' + (TYPE_COLORS[ev.eventType] || '#ccc'), marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{ev.title}</div>
        <div style={{ fontSize: 13, color: '#718096' }}>
          {new Date(ev.startDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.endDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          {ev.location ? ' | ' + ev.location : ''}
        </div>
        {ev.description && <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{ev.description}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(ev)}>Editar</button>
        {confirmDelete === ev.id ? (
          <>
            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => deleteEvent(ev.id)}>Si</button>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setConfirmDelete(null)}>No</button>
          </>
        ) : (
          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setConfirmDelete(ev.id)}>Eliminar</button>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1>Calendario</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={'btn ' + (view === 'month' ? 'btn-primary' : 'btn-outline')} onClick={() => setView('month')}>Mes</button>
          <button className={'btn ' + (view === 'list' ? 'btn-primary' : 'btn-outline')} onClick={() => setView('list')}>Lista</button>
          <button className="btn btn-success" onClick={() => openCreate(selectedDateStr)}>+ Nuevo</button>
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}<button onClick={() => setError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>x</button></div>}
      {successMsg && <div className="success-message" style={{ marginBottom: 16 }}>{successMsg}</div>}

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'meeting', 'reminder', 'appointment', 'event'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={'btn ' + (filterType === t ? 'btn-primary' : 'btn-outline')} style={{ padding: '6px 14px', fontSize: 14 }}>
              {t === 'all' ? 'Todos' : EVENT_TYPES[t]}
            </button>
          ))}
          <span style={{ fontSize: 14, color: '#718096', alignSelf: 'center', marginLeft: 8 }}>{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}><p>Cargando eventos...</p></div>
      ) : view === 'month' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <button className="btn btn-outline" style={{ padding: '6px 16px' }} onClick={prevMonth}>{'<'}</button>
            <h2 style={{ margin: 0 }}>{MONTHS[calMonth]} {calYear}</h2>
            <button className="btn btn-outline" style={{ padding: '6px 16px' }} onClick={nextMonth}>{'>'}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', padding: '10px 4px', fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#f9fafb' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calGrid.map((day, idx) => {
              const dayEvs = eventsForDay(day)
              const selected = selectedDay === day
              const todayCell = isToday(day)
              return (
                <div key={idx} onClick={() => day && setSelectedDay(selected ? null : day)}
                  style={{ minHeight: 80, padding: '6px 8px', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', background: selected ? '#eff6ff' : todayCell ? '#fef9c3' : day ? 'white' : '#f9fafb', cursor: day ? 'pointer' : 'default' }}>
                  {day && (
                    <>
                      <div style={{ fontSize: 13, fontWeight: todayCell ? 700 : 400, color: todayCell ? '#1d4ed8' : '#374151', marginBottom: 3 }}>{day}</div>
                      {dayEvs.slice(0, 2).map(ev => (
                        <div key={ev.id} style={{ fontSize: 11, background: TYPE_COLORS[ev.eventType] || '#6b7280', color: 'white', borderRadius: 3, padding: '1px 5px', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ev.title}>{ev.title}</div>
                      ))}
                      {dayEvs.length > 2 && <div style={{ fontSize: 11, color: '#6b7280' }}>+{dayEvs.length - 2} mas</div>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {selectedDay && (
            <div style={{ borderTop: '2px solid #e5e7eb', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>{selectedDay} de {MONTHS[calMonth]} {calYear}</h3>
                <button className="btn btn-success" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => openCreate(selectedDateStr)}>+ Agregar</button>
              </div>
              {selectedDayEvents.length === 0
                ? <p style={{ color: '#9ca3af' }}>Sin eventos este dia.</p>
                : selectedDayEvents.map(ev => <EventCard key={ev.id} ev={ev} />)
              }
            </div>
          )}
        </div>
      ) : (
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}><p>No hay eventos para mostrar.</p></div>
        ) : (
          Object.entries(grouped).map(([day, dayEvents]) => (
            <div key={day} style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#555', fontSize: 15, textTransform: 'capitalize', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                {day}
              </h3>
              {dayEvents.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          ))
        )
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>x</button>
            </div>
            <div className="modal-body">
              {formError && <div className="error-message" style={{ marginBottom: 12 }}>{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="review-section"><label>Titulo *</label><input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className="review-section"><label>Descripcion</label><textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="grid grid-2">
                  <div className="review-section"><label>Inicio *</label><input type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                  <div className="review-section"><label>Fin *</label><input type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required /></div>
                  <div className="review-section"><label>Ubicacion</label><input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Opcional" /></div>
                  <div className="review-section">
                    <label>Tipo</label>
                    <select value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                      <option value="meeting">Reunion</option>
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
