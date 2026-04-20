import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [communityStats, setCommunityStats] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStatistics();
  }, [selectedMonth, selectedYear]);

  const loadStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para ver las estadísticas.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;

      const response = await api.get('/admin/statistics', { params });
      setStats(response.data.data);
      api.get('/admin/stats/community').then(r => setCommunityStats(r.data.data || [])).catch(() => {});
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      if (error.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('No se pudieron cargar las estadísticas. Verifica el servidor.');
      }
    } finally {
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
          <p className="subtitle">
            Bienvenido, {user.fullName || user.username}
            {selectedMonth || selectedYear ? ' · Filtrando por periodo' : ''}
          </p>
        </div>
        <div className="header-actions">
          <div className="period-filters">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Todos los meses</option>
              <option value="Enero">Enero</option>
              <option value="Febrero">Febrero</option>
              <option value="Marzo">Marzo</option>
              <option value="Abril">Abril</option>
              <option value="Mayo">Mayo</option>
              <option value="Junio">Junio</option>
              <option value="Julio">Julio</option>
              <option value="Agosto">Agosto</option>
              <option value="Septiembre">Septiembre</option>
              <option value="Octubre">Octubre</option>
              <option value="Noviembre">Noviembre</option>
              <option value="Diciembre">Diciembre</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Todos los años</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            {(selectedMonth || selectedYear) && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedYear('');
                }}
              >
                Limpiar
              </button>
            )}
          </div>
          <Link to="/admin/reports" className="btn btn-outline">📋 Informes</Link>
          <Link to="/admin/students" className="btn btn-primary">👥 Estudiantes</Link>
        </div>
      </div>

      {error && (
        <div className="card error-card">
          <div className="error-row">
            <div>
              <h3>Ocurrió un problema</h3>
              <p className="error-text">{error}</p>
            </div>
            <button className="btn btn-outline" onClick={loadStatistics}>Reintentar</button>
          </div>
        </div>
      )}

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

      {/* Estadísticas por comunidad */}
      {communityStats.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h2>Estadísticas por Comunidad</h2></div>
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Comunidad</th>
                  <th>Brigadistas</th>
                  <th>Reportes</th>
                  <th>Aprobados</th>
                  <th>Pendientes</th>
                  <th>Horas</th>
                  <th>% Aprobación</th>
                </tr>
              </thead>
              <tbody>
                {communityStats.map(c => (
                  <tr key={c.community}>
                    <td><strong>{c.community}</strong></td>
                    <td>{c.brigadistas}</td>
                    <td>{c.totalReports}</td>
                    <td><span className="badge badge-success">{c.approved}</span></td>
                    <td><span className="badge badge-warning">{c.pending}</span></td>
                    <td>{c.totalHours}h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${c.totalReports > 0 ? Math.round(c.approved / c.totalReports * 100) : 0}%`, background: '#22c55e', height: '100%' }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280', minWidth: 32 }}>
                          {c.totalReports > 0 ? Math.round(c.approved / c.totalReports * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Informes recientes */}
      <div className="card">        <div className="card-header">
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
                          {report.brigadista?.fullName?.[0] || report.brigadista?.username?.[0] || 'U'}
                        </div>
                        <span>{report.brigadista?.fullName || report.brigadista?.username || report.studentName}</span>
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
