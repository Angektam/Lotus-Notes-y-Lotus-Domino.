import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import axios from '../api/axios';
import './AnalyticsDashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AnalyticsDashboard = ({ userRole }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'supervisor' ? '/analytics/supervisor' : '/analytics/brigadista';
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      
      const response = await axios.get(endpoint, { params });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error al cargar analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const response = await axios.get('/analytics/export/excel', {
        params,
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reportes_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar:', error);
      // silencioso — el usuario verá que no descargó nada
    }
  };

  if (loading) {
    return <div className="analytics-loading">Cargando analíticas...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Error al cargar analíticas</div>;
  }

  // Datos para gráfica de estados
  const statusChartData = {
    labels: analytics.reportsByStatus?.map(s => s.status) || [],
    datasets: [{
      label: 'Reportes por Estado',
      data: analytics.reportsByStatus?.map(s => s.count) || [],
      backgroundColor: [
        'rgba(255, 206, 86, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(46, 204, 113, 0.6)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(46, 204, 113, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Datos para gráfica de brigadistas (solo supervisor)
  const brigadistaChartData = userRole === 'supervisor' && analytics.reportsByBrigadista ? {
    labels: analytics.reportsByBrigadista.map(b => b.brigadistaName),
    datasets: [{
      label: 'Reportes por Brigadista',
      data: analytics.reportsByBrigadista.map(b => b.count),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  } : null;

  // Datos para tendencia mensual (solo supervisor)
  const trendChartData = userRole === 'supervisor' && analytics.monthlyTrend ? {
    labels: analytics.monthlyTrend.map(m => m.month),
    datasets: [{
      label: 'Reportes por Mes',
      data: analytics.monthlyTrend.map(m => m.count),
      fill: false,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  } : null;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Dashboard de Analíticas</h2>
        <div className="analytics-actions">
          <div className="date-filter">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              placeholder="Fecha fin"
            />
            <button onClick={fetchAnalytics} className="btn-filter">Filtrar</button>
          </div>
          <button onClick={exportToExcel} className="btn-export">
            📥 Exportar a Excel
          </button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="analytics-summary">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{analytics.summary.totalReports}</h3>
            <p>Total Reportes</p>
          </div>
        </div>

        {userRole === 'supervisor' ? (
          <>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{analytics.summary.approvedCount}</h3>
                <p>Aprobados</p>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>{analytics.summary.rejectedCount}</h3>
                <p>Observados</p>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <h3>{analytics.summary.overdueReports}</h3>
                <p>Vencidos</p>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>{analytics.summary.avgCompletionTime}</h3>
                <p>Días Promedio</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{analytics.summary.completedCount}</h3>
                <p>Completados</p>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{analytics.summary.pendingCount}</h3>
                <p>Pendientes</p>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <h3>{analytics.summary.overdueCount}</h3>
                <p>Vencidos</p>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>{analytics.summary.approvalRate}%</h3>
                <p>Tasa Aprobación</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Gráficas */}
      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Reportes por Estado</h3>
          <Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {userRole === 'supervisor' && brigadistaChartData && (
          <div className="chart-container">
            <h3>Reportes por Brigadista</h3>
            <Bar data={brigadistaChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        )}

        {userRole === 'supervisor' && trendChartData && (
          <div className="chart-container full-width">
            <h3>Tendencia Mensual</h3>
            <Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
