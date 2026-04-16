import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    reports: 0,
    totalHours: 0,
    drafts: 0,
    submitted: 0,
    approved: 0,
    notes: 0,
    tasks: 0
  })
  const [recentReports, setRecentReports] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token de autenticación');
      return;
    }

    try {
      const [reports, notes, tasks] = await Promise.all([
        api.get('/reports', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/notes'),
        api.get('/tasks/my-tasks')
      ]);

      const reportsData = reports.data.data || [];
      
      // Calcular estadísticas de informes
      const totalHours = reportsData.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      const drafts = reportsData.filter(r => r.status === 'draft').length;
      const submitted = reportsData.filter(r => r.status === 'submitted').length;
      const approved = reportsData.filter(r => r.status === 'approved').length;

      setStats({
        reports: reportsData.length,
        totalHours,
        drafts,
        submitted,
        approved,
        notes: notes.data.notes?.length || 0,
        tasks: tasks.data.tasks?.length || 0
      });

      // Obtener los 3 informes más recientes
      setRecentReports(reportsData.slice(0, 3));
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Sesión expirada');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.error('Error loading stats:', error);
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Borrador', class: 'badge-draft' },
      submitted: { text: 'Enviado', class: 'badge-submitted' },
      approved: { text: 'Aprobado', class: 'badge-approved' },
      rejected: { text: 'Rechazado', class: 'badge-rejected' }
    }
    return badges[status] || badges.draft
  }

  return (
    <div>
      <h1>📋 Servicio Social - {user.fullName || user.username}</h1>
      <p className="subtitle">Panel de Control de Informes</p>

      <div className="stats-grid">
        <div className="stat-card stat-reports">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.reports}</h3>
            <p>Informes Totales</p>
          </div>
        </div>

        <div className="stat-card stat-hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>{stats.totalHours}</h3>
            <p>Horas Acumuladas</p>
          </div>
        </div>

        <div className="stat-card stat-drafts">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.drafts}</h3>
            <p>Borradores</p>
          </div>
        </div>

        <div className="stat-card stat-approved">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Aprobados</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-reports card">
          <div className="card-header">
            <h2>Informes Recientes</h2>
            <Link to="/reports" className="btn-link">Ver todos →</Link>
          </div>
          {recentReports.length === 0 ? (
            <div className="empty-message">
              <p>No hay informes registrados</p>
              <Link to="/reports" className="btn-primary">Crear primer informe</Link>
            </div>
          ) : (
            <div className="reports-list-dashboard">
              {recentReports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-item-header">
                    <h4>{report.reportMonth} {report.reportYear}</h4>
                    <span className={`badge ${getStatusBadge(report.status).class}`}>
                      {getStatusBadge(report.status).text}
                    </span>
                  </div>
                  <p className="report-project">{report.projectName}</p>
                  <p className="report-hours">{report.totalHours} horas</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions card">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <Link to="/reports" className="action-btn action-primary">
              <span className="action-icon">📋</span>
              <span>Nuevo Informe</span>
            </Link>
            <Link to="/notes" className="action-btn action-secondary">
              <span className="action-icon">📝</span>
              <span>Notas ({stats.notes})</span>
            </Link>
            <Link to="/tasks" className="action-btn action-secondary">
              <span className="action-icon">✓</span>
              <span>Tareas ({stats.tasks})</span>
            </Link>
            <Link to="/calendar" className="action-btn action-secondary">
              <span className="action-icon">📅</span>
              <span>Calendario</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="welcome-card card">
        <h2>Guía de Uso</h2>
        <p>Sistema de gestión de informes mensuales de servicio social:</p>
        <ul>
          <li><strong>Informes:</strong> Crea y gestiona tus informes mensuales con objetivos, metas y evidencias</li>
          <li><strong>Seguimiento:</strong> Registra horas, participantes y actividades realizadas</li>
          <li><strong>Notas:</strong> Guarda apuntes y recordatorios importantes</li>
          <li><strong>Tareas:</strong> Organiza tus actividades pendientes del servicio social</li>
          <li><strong>Calendario:</strong> Programa fechas de entrega y eventos importantes</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
