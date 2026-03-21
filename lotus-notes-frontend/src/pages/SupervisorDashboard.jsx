import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Dashboard.css'

function SupervisorDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReview: 0,
    approved: 0,
    overdue: 0,
    totalBrigadistas: 0
  })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await api.get('/supervisor/dashboard/stats')
      setStats(res.data.data)
    } catch (error) {
      console.error('Error al cargar estadísticas del supervisor:', error)
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
      <h1>📊 Panel del Supervisor</h1>
      <p className="subtitle">Bienvenido, {user.fullName || user.username}</p>

      <div className="stats-grid">
        <div className="stat-card stat-reports" style={{ color: 'var(--primary-color)' }}>
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{stats.totalReports}</h3>
            <p>Reportes asignados</p>
          </div>
        </div>

        <div className="stat-card stat-pending" style={{ color: 'var(--warning-color)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingReview}</h3>
            <p>Pendientes de revisión</p>
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

      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h2>Acciones rápidas</h2>
          </div>
          <div className="quick-actions">
            <Link to="/supervisor/brigadistas" className="action-card">
              <div className="action-icon">👥</div>
              <h3>Brigadistas</h3>
              <p>{stats.totalBrigadistas} registrados</p>
            </Link>
            <Link to="/supervisor/assign" className="action-card">
              <div className="action-icon">📌</div>
              <h3>Asignar reporte</h3>
              <p>Crear y asignar un nuevo reporte</p>
            </Link>
            <Link to="/supervisor/pending" className="action-card">
              <div className="action-icon">🔎</div>
              <h3>Revisar pendientes</h3>
              <p>{stats.pendingReview} por revisar</p>
            </Link>
            <Link to="/tasks" className="action-card">
              <div className="action-icon">✅</div>
              <h3>Tareas</h3>
              <p>Gestiona tus tareas</p>
            </Link>
            <Link to="/messages" className="action-card">
              <div className="action-icon">💬</div>
              <h3>Mensajes</h3>
              <p>Bandeja de entrada</p>
            </Link>
            {stats.overdue > 0 && (
              <Link to="/supervisor/pending" className="action-card" style={{ borderColor: '#e74c3c' }}>
                <div className="action-icon">⚠️</div>
                <h3 style={{ color: '#e74c3c' }}>Vencidos</h3>
                <p>{stats.overdue} reporte{stats.overdue !== 1 ? 's' : ''} vencido{stats.overdue !== 1 ? 's' : ''}</p>
              </Link>
            )}
          </div>
        </div>

        <div className="welcome-card card">
          <h2>Flujo de trabajo</h2>
          <ul>
            <li><strong>Asignar:</strong> registra brigadistas y asigna reportes con fecha de entrega</li>
            <li><strong>Recibir:</strong> el brigadista elabora y envía el reporte</li>
            <li><strong>Revisar:</strong> aprueba o solicita correcciones (observaciones)</li>
            <li><strong>Ciclo:</strong> se repite hasta que el reporte sea aceptado</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SupervisorDashboard

