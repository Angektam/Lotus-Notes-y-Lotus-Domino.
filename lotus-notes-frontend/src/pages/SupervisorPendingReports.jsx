import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

function SupervisorPendingReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewComments, setReviewComments] = useState('')

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    try {
      const res = await api.get('/supervisor/reports/pending')
      setReports(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar pendientes:', error)
      alert('Error al cargar reportes pendientes')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (report) => {
    setSelectedReport(report)
    setReviewComments(report.reviewComments || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setReviewComments('')
  }

  const approve = async (reportId) => {
    try {
      await api.put(`/supervisor/reports/${reportId}/review`, {
        action: 'APPROVE',
        comments: reviewComments,
        observations: []
      })
      alert('Reporte aprobado')
      closeModal()
      loadPending()
    } catch (error) {
      console.error('Error al aprobar:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al aprobar')
    }
  }

  const requestFixes = async (reportId) => {
    if (!reviewComments.trim()) {
      alert('Agrega comentarios/observaciones para solicitar correcciones')
      return
    }

    try {
      await api.put(`/supervisor/reports/${reportId}/review`, {
        action: 'REJECT',
        comments: reviewComments,
        observations: []
      })
      alert('Correcciones solicitadas')
      closeModal()
      loadPending()
    } catch (error) {
      console.error('Error al solicitar correcciones:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al solicitar correcciones')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando reportes pendientes...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔎 Pendientes de revisión</h1>
        <p className="subtitle">Reportes enviados por brigadistas</p>
      </div>

      <div className="reports-grid">
        {reports.length === 0 ? (
          <div className="empty-state card">
            <p>No tienes reportes pendientes</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card card">
              <div className="report-card-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {(report.brigadista?.fullName || report.brigadista?.username || 'B')[0]}
                  </div>
                  <div>
                    <h3>{report.brigadista?.fullName || report.brigadista?.username}</h3>
                    <p className="student-email">{report.brigadista?.email}</p>
                  </div>
                </div>
                <span className="badge badge-warning">ENVIADO</span>
              </div>

              <div className="report-details">
                <div className="detail-row">
                  <span className="detail-label">Título:</span>
                  <span className="detail-value">{report.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vence:</span>
                  <span className="detail-value">{new Date(report.dueDate).toLocaleDateString('es-MX')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Versión:</span>
                  <span className="detail-value">{report.version}</span>
                </div>
              </div>

              <div className="report-actions">
                <button className="btn btn-outline" onClick={() => openModal(report)}>
                  👁️ Ver / Revisar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Revisar reporte</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="report-full-details">
                <h3>{selectedReport.title}</h3>
                <p><strong>Brigadista:</strong> {selectedReport.brigadista?.fullName || selectedReport.brigadista?.username}</p>
                <p><strong>Fecha límite:</strong> {new Date(selectedReport.dueDate).toLocaleDateString('es-MX')}</p>
                {selectedReport.description && (
                  <>
                    <h4>Descripción</h4>
                    <p>{selectedReport.description}</p>
                  </>
                )}

                <h4>Actividades</h4>
                {Array.isArray(selectedReport.activities) && selectedReport.activities.length > 0 ? (
                  selectedReport.activities.map((a, idx) => (
                    <div key={idx} className="objective-item">
                      <p><strong>Fecha:</strong> {a.date ? new Date(a.date).toLocaleDateString('es-MX') : '-'}</p>
                      <p><strong>Descripción:</strong> {a.description || '-'}</p>
                      {a.location ? <p><strong>Lugar:</strong> {a.location}</p> : null}
                      {a.findings ? <p><strong>Hallazgos:</strong> {a.findings}</p> : null}
                    </div>
                  ))
                ) : (
                  <p>Sin actividades registradas</p>
                )}
              </div>

              <div className="review-section">
                <label>Comentarios / Observaciones</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Indica qué debe corregir o confirma aprobación..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-success" onClick={() => approve(selectedReport.id)}>✓ Aceptar</button>
              <button className="btn btn-danger" onClick={() => requestFixes(selectedReport.id)}>✕ Solicitar correcciones</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupervisorPendingReports

