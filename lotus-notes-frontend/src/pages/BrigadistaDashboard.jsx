import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Dashboard.css'

function BrigadistaDashboard() {
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    approved: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await api.get('/brigadista/dashboard/stats')
      setStats(res.data.data)
    } catch (error) {
      console.error('Error al cargar stats del brigadista:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>🧑‍🚒 Panel del Brigadista</h1>
      <p className="subtitle">Bienvenido, {user.fullName || user.username}</p>

      <div className="stats-grid">
        <div className="stat-card stat-reports" style={{ color: 'var(--primary-color)' }}>
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{stats.totalAssigned}</h3>
            <p>Asignados</p>
          </div>
        </div>

        <div className="stat-card stat-pending" style={{ color: 'var(--warning-color)' }}>
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pendientes</p>
          </div>
        </div>

        <div className="stat-card stat-approved" style={{ color: 'var(--secondary-color)' }}>
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Aprobados</p>
          </div>
        </div>

        <div className="stat-card stat-overdue" style={{ color: 'var(--danger-color)' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.overdue}</h3>
            <p>Vencidos</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Acciones rápidas</h2>
        </div>
        <div className="quick-actions">
          <Link to="/brigadista/reports" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Mis reportes</h3>
            <p>Elaborar, enviar y corregir</p>
          </Link>
          <Link to="/tasks" className="action-card">
            <div className="action-icon">✅</div>
            <h3>Tareas</h3>
            <p>Gestiona tus tareas</p>
          </Link>
          <Link to="/notes" className="action-card">
            <div className="action-icon">📝</div>
            <h3>Notas</h3>
            <p>Tus apuntes y notas</p>
          </Link>
          <Link to="/messages" className="action-card">
            <div className="action-icon">💬</div>
            <h3>Mensajes</h3>
            <p>Bandeja de entrada</p>
          </Link>
          <Link to="/calendar" className="action-card">
            <div className="action-icon">📅</div>
            <h3>Calendario</h3>
            <p>Eventos y recordatorios</p>
          </Link>
          <Link to="/brigadista/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h3>Mi Perfil</h3>
            <p>Ver y editar tu información</p>
          </Link>
        </div>
      </div>

      <div className="welcome-card card">
        <h2>Cómo completar el flujo</h2>
        <ul>
          <li><strong>Elaborar:</strong> edita tu reporte y registra actividades</li>
          <li><strong>Enviar:</strong> mándalo a revisión cuando esté listo</li>
          <li><strong>Corregir:</strong> si el supervisor observa, ajusta y vuelve a enviar</li>
        </ul>
      </div>
    </div>
  )
}

export default BrigadistaDashboard

