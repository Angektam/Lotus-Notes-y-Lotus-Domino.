import { useState, useEffect } from 'react';
import api from '../api/axios';
import './AdminReports.css';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [filters, reports]);

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar informes:', error);
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.student?.fullName?.toLowerCase().includes(search) ||
        r.student?.username?.toLowerCase().includes(search) ||
        r.projectName?.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  };

  const handleApprove = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/reports/${reportId}/approve`, 
        { comments: reviewComments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Informe aprobado exitosamente');
      setShowModal(false);
      setReviewComments('');
      loadReports();
    } catch (error) {
      console.error('Error al aprobar informe:', error);
      alert('Error al aprobar el informe');
    }
  };

  const handleReject = async (reportId) => {
    if (!reviewComments.trim()) {
      alert('Debes proporcionar comentarios al rechazar un informe');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/reports/${reportId}/reject`, 
        { comments: reviewComments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Informe rechazado');
      setShowModal(false);
      setReviewComments('');
      loadReports();
    } catch (error) {
      console.error('Error al rechazar informe:', error);
      alert('Error al rechazar el informe');
    }
  };

  const openReviewModal = (report) => {
    setSelectedReport(report);
    setReviewComments(report.reviewComments || '');
    setShowModal(true);
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
        <p>Cargando informes...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="page-header">
        <h1>📋 Gestión de Informes</h1>
        <p className="subtitle">Revisa y aprueba los informes de servicio social</p>
      </div>

      {/* Filtros */}
      <div className="filters-card card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Estado</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="submitted">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Buscar por estudiante o proyecto..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
        </div>

        <div className="filter-summary">
          Mostrando {filteredReports.length} de {reports.length} informes
        </div>
      </div>

      {/* Lista de informes */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron informes</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="report-card card">
              <div className="report-card-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {report.student?.fullName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3>{report.student?.fullName || report.student?.username}</h3>
                    <p className="student-email">{report.student?.email}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(report.status).class}`}>
                  {getStatusBadge(report.status).text}
                </span>
              </div>

              <div className="report-details">
                <div className="detail-row">
                  <span className="detail-label">Periodo:</span>
                  <span className="detail-value">{report.reportMonth} {report.reportYear}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Proyecto:</span>
                  <span className="detail-value">{report.projectName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dependencia:</span>
                  <span className="detail-value">{report.dependencyName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Horas:</span>
                  <span className="detail-value">{report.totalHours}h</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Objetivos:</span>
                  <span className="detail-value">{report.objectives?.length || 0}</span>
                </div>
              </div>

              {report.reviewComments && (
                <div className="review-comments">
                  <strong>Comentarios de revisión:</strong>
                  <p>{report.reviewComments}</p>
                </div>
              )}

              <div className="report-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => openReviewModal(report)}
                >
                  👁️ Ver Detalle
                </button>
                {report.status === 'submitted' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        setSelectedReport(report);
                        setReviewComments('');
                        handleApprove(report.id);
                      }}
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => openReviewModal(report)}
                    >
                      ✕ Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de revisión */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Revisar Informe</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="report-full-details">
                <h3>{selectedReport.student?.fullName}</h3>
                <p><strong>Periodo:</strong> {selectedReport.reportMonth} {selectedReport.reportYear}</p>
                <p><strong>Proyecto:</strong> {selectedReport.projectName}</p>
                <p><strong>Dependencia:</strong> {selectedReport.dependencyName}</p>
                <p><strong>Horas:</strong> {selectedReport.totalHours}</p>

                <h4>Objetivos y Actividades</h4>
                {selectedReport.objectives?.map((obj, idx) => (
                  <div key={idx} className="objective-item">
                    <p><strong>Objetivo:</strong> {obj.objective}</p>
                    <p><strong>Metas:</strong> {obj.goals}</p>
                    <p><strong>Actividades:</strong> {obj.activities}</p>
                  </div>
                ))}

                <h4>Observaciones</h4>
                <p>{selectedReport.observations || 'Sin observaciones'}</p>
              </div>

              <div className="review-section">
                <label>Comentarios de Revisión</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Agrega comentarios sobre el informe..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              {selectedReport.status === 'submitted' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedReport.id)}
                  >
                    ✓ Aprobar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleReject(selectedReport.id)}
                  >
                    ✕ Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
