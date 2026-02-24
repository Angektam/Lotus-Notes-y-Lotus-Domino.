import { useState, useEffect } from 'react'
import api from '../api/axios'

function Tasks() {
  const [tasks, setTasks] = useState([])
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
    try {
      const response = await api.get('/tasks/my-tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      await api.post('/tasks', { ...formData, assignedTo: user.id })
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' })
      setShowForm(false)
      loadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status })
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id) => {
    if (confirm('¿Eliminar esta tarea?')) {
      try {
        await api.delete(`/tasks/${id}`)
        loadTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mis Tareas</h1>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Tarea'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Crear Nueva Tarea</h3>
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

      <div className="grid grid-2">
        {tasks.map((task) => (
          <div key={task.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3>{task.title}</h3>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>
            <p style={{ color: '#4a5568', marginBottom: '12px' }}>{task.description}</p>
            {task.dueDate && (
              <p style={{ fontSize: '14px', color: '#718096' }}>
                Vence: {new Date(task.dueDate).toLocaleDateString()}
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
    </div>
  )
}

export default Tasks
