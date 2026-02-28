import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    totalStudents: 0,
    totalHours: 0,
    reportsByStatus: {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    },
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Borrador', class: 'badge-secondary' },
      submitted: { text: 'Pendiente', class: 'badge-warning' },
      approved: { text: 'Aprobado', class: 'badge-success' },
      rejected: { text: 'Rechazado', class: 'badge-danger' }
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🎯 Panel de Administración</h1>
          <p className="subtitle">Bienvenido, {user.fullName || user.username}</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalReports}</h3>
            <p>Total Informes</p>
          </div>
        </div>

        <div className="stat-card stat-students">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Estudiantes</p>
          </div>
        </div>

        <div className="stat-card stat-hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>{stats.totalHours}</h3>
            <p>Horas Totales</p>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.reportsByStatus.submitted || 0}</h3>
            <p>Pendientes</p>
          </div>
        </div>
      </div>

      {/* Distribución por estado */}
      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h2>Distribución de Informes</h2>
          </div>
          <div className="status-distribution">
            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill status-draft"
                  style={{ width: `${(stats.reportsByStatus.draft / stats.totalReports * 100) || 0}%` }}
                ></div>
              </div>
              <div className="status-label">
                <span className="badge badge-secondary">Borradores</span>
                <span className="status-count">{stats.reportsByStatus.draft || 0}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill status-submitted"
                  style={{ width: `${(stats.reportsByStatus.submitted / stats.totalReports * 100) || 0}%` }}
                ></div>
              </div>
              <div className="status-label">
                <span className="badge badge-warning">Pendientes</span>
                <span className="status-count">{stats.reportsByStatus.submitted || 0}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill status-approved"
                  style={{ width: `${(stats.reportsByStatus.approved / stats.totalReports * 100) || 0}%` }}
                ></div>
              </div>
              <div className="status-label">
                <span className="badge badge-success">Aprobados</span>
                <span className="status-count">{stats.reportsByStatus.approved || 0}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill status-rejected"
                  style={{ width: `${(stats.reportsByStatus.rejected / stats.totalReports * 100) || 0}%` }}
                ></div>
              </div>
              <div className="status-label">
                <span className="badge badge-danger">Rechazados</span>
                <span className="status-count">{stats.reportsByStatus.rejected || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Acciones Rápidas</h2>
          </div>
          <div className="quick-actions">
            <Link to="/admin/reports" className="action-card">
              <div className="action-icon">📋</div>
              <h3>Revisar Informes</h3>
              <p>{stats.reportsByStatus.submitted || 0} pendientes</p>
            </Link>
            <Link to="/admin/students" className="action-card">
              <div className="action-icon">👥</div>
              <h3>Gestionar Estudiantes</h3>
              <p>{stats.totalStudents} registrados</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Informes recientes */}
      <div className="card">
        <div className="card-header">
          <h2>Informes Recientes</h2>
          <Link to="/admin/reports" className="btn-link">Ver todos →</Link>
        </div>
        {stats.recentReports.length === 0 ? (
          <div className="empty-message">
            <p>No hay informes recientes</p>
          </div>
        ) : (
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Periodo</th>
                  <th>Horas</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {report.student?.fullName?.[0] || report.student?.username?.[0] || 'U'}
                        </div>
                        <span>{report.student?.fullName || report.student?.username}</span>
                      </div>
                    </td>
                    <td>{report.reportMonth} {report.reportYear}</td>
                    <td>{report.totalHours}h</td>
                    <td>
                      <span className={`badge ${getStatusBadge(report.status).class}`}>
                        {getStatusBadge(report.status).text}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
