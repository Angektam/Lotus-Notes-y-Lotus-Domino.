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
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [filters, reports]);

  const loadReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data.data || []);
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
        r.brigadista?.fullName?.toLowerCase().includes(search) ||
        r.brigadista?.username?.toLowerCase().includes(search) ||
        r.projectName?.toLowerCase().includes(search) ||
        r.title?.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  };

  const handleApprove = async (reportId) => {
    try {
      await api.put(`/admin/reports/${reportId}/approve`, { comments: reviewComments });
      setActionMessage({ type: 'success', text: 'Informe aprobado exitosamente' });
      setShowModal(false);
      setReviewComments('');
      loadReports();
    } catch (error) {
      console.error('Error al aprobar informe:', error);
      setActionMessage({ type: 'error', text: error.response?.data?.message || 'Error al aprobar el informe' });
    }
  };

  const handleReject = async (reportId) => {
    if (!reviewComments.trim()) {
      setActionMessage({ type: 'error', text: 'Debes proporcionar comentarios al rechazar un informe' });
      return;
    }

    try {
      await api.put(`/admin/reports/${reportId}/reject`, { comments: reviewComments });
      setActionMessage({ type: 'success', text: 'Informe rechazado con observaciones' });
      setShowModal(false);
      setReviewComments('');
      loadReports();
    } catch (error) {
      console.error('Error al rechazar informe:', error);
      setActionMessage({ type: 'error', text: error.response?.data?.message || 'Error al rechazar el informe' });
    }
  };

  const openReviewModal = (report) => {
    setSelectedReport(report);
    setReviewComments(report.reviewComments || '');
    setShowModal(true);
  };

  const isReviewable = (status) => {
    return status === 'submitted' || status === 'ENVIADO'
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Borrador', class: 'badge-secondary' },
      submitted: { text: 'Pendiente', class: 'badge-warning' },
      approved: { text: 'Aprobado', class: 'badge-success' },
      rejected: { text: 'Rechazado', class: 'badge-danger' },
      ASIGNADO: { text: 'Asignado', class: 'badge-primary' },
      EN_ELABORACION: { text: 'En elaboración', class: 'badge-warning' },
      ENVIADO: { text: 'Enviado', class: 'badge-warning' },
      OBSERVADO: { text: 'Con observaciones', class: 'badge-danger' },
      APROBADO: { text: 'Aprobado', class: 'badge-success' }
    };
    return badges[status] || { text: status, class: 'badge-secondary' };
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

      {actionMessage.text && (
        <div className={actionMessage.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: '16px' }}>
          {actionMessage.text}
          <button onClick={() => setActionMessage({ type: '', text: '' })} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

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
              <option value="submitted">Pendiente (legacy)</option>
              <option value="ENVIADO">Enviado</option>
              <option value="approved">Aprobado (legacy)</option>
              <option value="APROBADO">Aprobado</option>
              <option value="rejected">Rechazado (legacy)</option>
              <option value="OBSERVADO">Con observaciones</option>
              <option value="draft">Borrador</option>
              <option value="ASIGNADO">Asignado</option>
              <option value="EN_ELABORACION">En elaboración</option>
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
                    {report.brigadista?.fullName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3>{report.brigadista?.fullName || report.brigadista?.username || report.studentName}</h3>
                    <p className="student-email">{report.brigadista?.email}</p>
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
                {isReviewable(report.status) && (
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
                <h3>{selectedReport.brigadista?.fullName || selectedReport.studentName}</h3>
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
                ✕ Rechazar / Observaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
