import { useState, useEffect } from 'react'
import api from '../api/axios'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/tasks/my-tasks')
      setTasks(response.data.tasks || [])
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('No se pudieron cargar las tareas. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('El título es obligatorio')
      return
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      setFormError('La fecha de vencimiento no puede ser en el pasado')
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await api.post('/tasks', { ...formData, assignedTo: user.id })
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' })
      setShowForm(false)
      loadTasks()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Error al crear la tarea')
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mis Tareas</h1>
        <button className="btn btn-success" onClick={() => { setShowForm(!showForm); setFormError('') }}>
          {showForm ? 'Cancelar' : '+ Nueva Tarea'}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3>Crear Nueva Tarea</h3>
          {formError && <div className="error-message" style={{ marginBottom: '12px' }}>{formError}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título *"
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
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <button type="submit" className="btn btn-primary">Crear Tarea</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#718096' }}>Cargando tareas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            {tasks.map((task) => (
              <div key={task.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3>{task.title}</h3>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
                <p style={{ color: '#4a5568', marginBottom: '12px' }}>{task.description}</p>
                {task.dueDate && (
                  <p style={{ fontSize: '14px', color: new Date(task.dueDate) < new Date() ? '#e53e3e' : '#718096' }}>
                    Vence: {new Date(task.dueDate).toLocaleDateString('es-MX')}
                    {new Date(task.dueDate) < new Date() && task.status !== 'completed' && ' ⚠️ Vencida'}
                  </p>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    style={{ width: 'auto', marginBottom: 0 }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                  <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && !showForm && (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '18px', color: '#718096' }}>No tienes tareas asignadas.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Tasks
