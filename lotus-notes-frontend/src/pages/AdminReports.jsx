import { useState, useEffect } from 'react';
import api from '../api/axios';
import './AdminReports.css';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkComments, setBulkComments] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  // IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    loadReports(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    loadReports(1);
  }, [filters.status]);

  useEffect(() => {
    filterReports();
  }, [filters.search, reports]);

  const loadReports = async (p = 1) => {
    try {
      const params = { page: p, limit: 20 };
      if (filters.status !== 'all') params.status = filters.status;
      const response = await api.get('/admin/reports', { params });
      setReports(response.data.data || []);
      setPagination(response.data.pagination || null);
      setSelectedIds([]);
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
    setAiResult(null);
    setShowModal(true);
  };

  const analyzeWithAI = async (reportId) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post(`/supervisor/reports/${reportId}/ai-analyze`);
      const data = res.data.data;
      setAiResult(data);
      if (data.comentario && !reviewComments.trim()) setReviewComments(data.comentario);
    } catch (err) {
      setAiResult({ error: err.response?.data?.message || 'Error al contactar la IA' });
    } finally {
      setAiLoading(false);
    }
  };

  const isReviewable = (status) => {
    return status === 'submitted' || status === 'ENVIADO'
  }

  // Bulk helpers
  const reviewableIds = filteredReports
    .filter(r => isReviewable(r.status))
    .map(r => r.id);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allSelected = reviewableIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : reviewableIds);
  };

  const openBulkModal = (action) => {
    if (selectedIds.length === 0) return;
    setBulkAction(action);
    setBulkComments('');
    setShowBulkModal(true);
  };

  const handleBulkReview = async () => {
    if (bulkAction === 'reject' && !bulkComments.trim()) {
      setActionMessage({ type: 'error', text: 'Debes proporcionar comentarios al rechazar informes' });
      return;
    }
    setBulkLoading(true);
    try {
      const res = await api.post('/admin/reports/bulk-review', {
        ids: selectedIds,
        action: bulkAction,
        comments: bulkComments
      });
      setActionMessage({ type: 'success', text: res.data.message });
      setShowBulkModal(false);
      setSelectedIds([]);
      loadReports();
    } catch (error) {
      setActionMessage({ type: 'error', text: error.response?.data?.message || 'Error al procesar informes' });
    } finally {
      setBulkLoading(false);
    }
  };

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
          {pagination
            ? `${pagination.total} informes — página ${pagination.page} de ${pagination.totalPages}`
            : `${filteredReports.length} informes`}
        </div>      </div>

      {/* Barra de acciones en lote */}
      {reviewableIds.length > 0 && (
        <div className="bulk-actions-bar card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '12px', background: selectedIds.length > 0 ? 'var(--primary-light, #e8f0fe)' : undefined }}>
          <input
            type="checkbox"
            id="select-all"
            checked={reviewableIds.length > 0 && reviewableIds.every(id => selectedIds.includes(id))}
            onChange={toggleSelectAll}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="select-all" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px' }}>
            {selectedIds.length > 0 ? `${selectedIds.length} seleccionado(s)` : `Seleccionar todos los revisables (${reviewableIds.length})`}
          </label>
          {selectedIds.length > 0 && (
            <>
              <button className="btn btn-success" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => openBulkModal('approve')}>
                ✓ Aprobar seleccionados
              </button>
              <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => openBulkModal('reject')}>
                ✕ Rechazar seleccionados
              </button>
              <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => setSelectedIds([])}>
                Limpiar
              </button>
            </>
          )}
        </div>
      )}

      {/* Lista de informes */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron informes</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className={`report-card card${selectedIds.includes(report.id) ? ' report-card--selected' : ''}`}>
              <div className="report-card-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  {isReviewable(report.status) && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(report.id)}
                      onChange={() => toggleSelect(report.id)}
                      style={{ marginTop: '4px', width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }}
                      aria-label={`Seleccionar informe de ${report.brigadista?.fullName || report.studentName}`}
                    />
                  )}
                  <div className="student-info">
                    <div className="student-avatar">
                      {report.brigadista?.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <h3>{report.brigadista?.fullName || report.brigadista?.username || report.studentName}</h3>
                      <p className="student-email">{report.brigadista?.email}</p>
                    </div>
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

              {/* Panel IA */}
              <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>🤖 Análisis con IA</span>
                  <button className="btn btn-outline" style={{ padding: '4px 14px', fontSize: 13 }}
                    onClick={() => analyzeWithAI(selectedReport.id)} disabled={aiLoading}>
                    {aiLoading ? '⏳ Analizando...' : aiResult ? '🔄 Re-analizar' : '✨ Analizar'}
                  </button>
                </div>
                {aiLoading && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#718096', fontSize: 14 }}>
                    <div className="spinner" style={{ margin: '0 auto 8px' }}></div>
                    Analizando con IA...
                  </div>
                )}
                {aiResult && !aiLoading && (
                  <div style={{ padding: 16 }}>
                    {aiResult.error ? (
                      <div className="error-message">{aiResult.error}</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: aiResult.puntuacion >= 8 ? '#22c55e' : aiResult.puntuacion >= 5 ? '#f59e0b' : '#ef4444' }}>
                            {aiResult.puntuacion}/10
                          </span>
                          <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            background: aiResult.recomendacion === 'APROBAR' ? '#dcfce7' : '#fef3c7',
                            color: aiResult.recomendacion === 'APROBAR' ? '#16a34a' : '#d97706' }}>
                            {aiResult.recomendacion === 'APROBAR' ? '✓ APROBAR' : '⚠ OBSERVAR'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 10 }}>{aiResult.resumen}</p>
                        {aiResult.observaciones?.length > 0 && (
                          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
                            {aiResult.observaciones.map((o, i) => <li key={i} style={{ fontSize: 13, color: '#4b5563', marginBottom: 3 }}>{o}</li>)}
                          </ul>
                        )}
                        {aiResult.comentario && (
                          <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}
                            onClick={() => setReviewComments(aiResult.comentario)}>
                            Usar comentario de IA
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
                {!aiResult && !aiLoading && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                    Haz clic en "Analizar" para obtener un resumen y recomendación automática.
                  </div>
                )}
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
      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ← Anterior
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>}
                <button
                  className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: 40 }}
                  onClick={() => setPage(p)}
                >{p}</button>
              </span>
            ))}
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de revisión en lote */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{bulkAction === 'approve' ? '✓ Aprobar informes' : '✕ Rechazar informes'}</h2>
              <button className="btn-close" onClick={() => setShowBulkModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px' }}>
                Se {bulkAction === 'approve' ? 'aprobarán' : 'rechazarán'} <strong>{selectedIds.length}</strong> informe(s).
              </p>
              <div className="review-section">
                <label>Comentarios {bulkAction === 'reject' ? '(requerido)' : '(opcional)'}</label>
                <textarea
                  value={bulkComments}
                  onChange={(e) => setBulkComments(e.target.value)}
                  placeholder={bulkAction === 'approve' ? 'Comentario general (opcional)...' : 'Motivo del rechazo...'}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)} disabled={bulkLoading}>
                Cancelar
              </button>
              <button
                className={`btn ${bulkAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleBulkReview}
                disabled={bulkLoading}
              >
                {bulkLoading ? 'Procesando...' : bulkAction === 'approve' ? '✓ Confirmar aprobación' : '✕ Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
