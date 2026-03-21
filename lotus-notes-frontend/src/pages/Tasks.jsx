import { useState, useEffect } from 'react'
import api from '../api/axios'

const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' }
const STATUS_LABELS = { pending: 'Pendiente', in_progress: 'En Progreso', completed: 'Completada', cancelled: 'Cancelada' }

const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '' }

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' })

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/tasks/my-tasks')
      setTasks(response.data.tasks || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar las tareas.')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingTask(null)
    setFormData(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.title.trim()) { setFormError('El título es obligatorio'); return }
    if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0,0,0,0)) {
      setFormError('La fecha de vencimiento no puede ser en el pasado'); return
    }
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData)
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        await api.post('/tasks', { ...formData, assignedTo: user.id })
      }
      setShowForm(false)
      loadTasks()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Error al guardar la tarea')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status })
      loadTasks()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la tarea')
    }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    try {
      await api.delete(`/tasks/${id}`)
      loadTasks()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la tarea')
    }
  }

  const filtered = tasks.filter(t => {
    if (filters.status !== 'all' && t.status !== filters.status) return false
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mis Tareas</h1>
        <button className="btn btn-success" onClick={openCreate}>+ Nueva Tarea</button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#718096', display: 'block', marginBottom: '4px' }}>Estado</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={{ width: 'auto' }}>
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#718096', display: 'block', marginBottom: '4px' }}>Prioridad</label>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} style={{ width: 'auto' }}>
              <option value="all">Todas</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <span style={{ fontSize: '13px', color: '#718096', marginTop: '18px' }}>
            {filtered.length} de {tasks.length} tareas
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#718096' }}>Cargando tareas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            {filtered.map((task) => (
              <div key={task.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3>{task.title}</h3>
                  <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority] || task.priority}</span>
                </div>
                {task.description && <p style={{ color: '#4a5568', marginBottom: '12px' }}>{task.description}</p>}
                {task.dueDate && (
                  <p style={{ fontSize: '14px', color: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '#e53e3e' : '#718096', marginBottom: '12px' }}>
                    Vence: {new Date(task.dueDate).toLocaleDateString('es-MX')}
                    {new Date(task.dueDate) < new Date() && task.status !== 'completed' && ' ⚠️'}
                  </p>
                )}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                  <button className="btn btn-outline" onClick={() => openEdit(task)}>✏️ Editar</button>
                  <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '18px', color: '#718096' }}>No hay tareas para mostrar.</p>
            </div>
          )}
        </>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
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
                    <label>Prioridad</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div className="review-section">
                    <label>Fecha límite</label>
                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: '16px 0 0' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingTask ? 'Guardar cambios' : 'Crear Tarea'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
