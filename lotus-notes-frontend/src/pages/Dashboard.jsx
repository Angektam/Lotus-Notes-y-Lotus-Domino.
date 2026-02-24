import { useState, useEffect } from 'react'
import api from '../api/axios'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    notes: 0,
    tasks: 0,
    events: 0,
    messages: 0
  })
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [notes, tasks, events, messages] = await Promise.all([
        api.get('/notes'),
        api.get('/tasks/my-tasks'),
        api.get('/calendar'),
        api.get('/messages/inbox')
      ])

      setStats({
        notes: notes.data.notes?.length || 0,
        tasks: tasks.data.tasks?.length || 0,
        events: events.data.events?.length || 0,
        messages: messages.data.messages?.length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div>
      <h1>Bienvenido, {user.fullName || user.username}</h1>
      <p className="subtitle">Panel de Control Lotus Notes</p>

      <div className="stats-grid">
        <div className="stat-card stat-notes">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.notes}</h3>
            <p>Notas</p>
          </div>
        </div>

        <div className="stat-card stat-tasks">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{stats.tasks}</h3>
            <p>Tareas</p>
          </div>
        </div>

        <div className="stat-card stat-events">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.events}</h3>
            <p>Eventos</p>
          </div>
        </div>

        <div className="stat-card stat-messages">
          <div className="stat-icon">✉</div>
          <div className="stat-info">
            <h3>{stats.messages}</h3>
            <p>Mensajes</p>
          </div>
        </div>
      </div>

      <div className="welcome-card card">
        <h2>Comenzar</h2>
        <p>Usa el menú de navegación para acceder a todas las funciones del sistema:</p>
        <ul>
          <li>Crear y gestionar notas personales o públicas</li>
          <li>Organizar tareas y asignar responsabilidades</li>
          <li>Programar eventos y reuniones en el calendario</li>
          <li>Comunicarte con tu equipo mediante mensajes</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
