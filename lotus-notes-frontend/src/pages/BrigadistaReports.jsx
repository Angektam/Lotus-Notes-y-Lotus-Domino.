import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

function BrigadistaReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all' })

  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [edit, setEdit] = useState({
    description: '',
    observations: '',
    activities: []
  })

  const [reviewComments, setReviewComments] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newReport, setNewReport] = useState({ title: '', description: '', dueDate: '', periodStart: '', periodEnd: '' })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const res = await api.get('/brigadista/reports')
      setReports(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar mis reportes:', error)
      alert('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (filters.status === 'all') return reports
    return reports.filter(r => r.status === filters.status)
  }, [reports, filters.status])

  const statusBadge = (status) => {
    const map = {
      ASIGNADO: { text: 'Asignado', class: 'badge-primary' },
      EN_ELABORACION: { text: 'En elaboración', class: 'badge-warning' },
      ENVIADO: { text: 'Enviado', class: 'badge-warning' },
      OBSERVADO: { text: 'Con observaciones', class: 'badge-danger' },
      APROBADO: { text: 'Aprobado', class: 'badge-success' }
    }
    return map[status] || { text: status, class: 'badge-secondary' }
  }

  const openModal = (report) => {
    setSelectedReport(report)
    setEdit({
      description: report.description || '',
      observations: report.observations || '',
      activities: Array.isArray(report.activities) ? report.activities : []
    })
    setReviewComments(report.reviewComments || '')
    setFileToUpload(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setReviewComments('')
    setFileToUpload(null)
  }

  const createReport = async () => {
    if (!newReport.title.trim() || !newReport.dueDate) {
      alert('Título y fecha límite son obligatorios')
      return
    }
    setCreating(true)
    try {
      await api.post('/brigadista/reports', newReport)
      setShowCreateModal(false)
      setNewReport({ title: '', description: '', dueDate: '', periodStart: '', periodEnd: '' })
      loadReports()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear reporte')
    } finally {
      setCreating(false)
    }
  }

  const addActivity = () => {
    setEdit(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { date: new Date().toISOString().slice(0, 10), description: '', location: '', findings: '' }
      ]
    }))
  }

  const updateActivity = (idx, field, value) => {
    setEdit(prev => {
      const next = [...prev.activities]
      next[idx] = { ...next[idx], [field]: value }
      return { ...prev, activities: next }
    })
  }

  const removeActivity = (idx) => {
    setEdit(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== idx)
    }))
  }

  const save = async () => {
    if (!selectedReport) return
    try {
      await api.put(`/brigadista/reports/${selectedReport.id}`, {
        description: edit.description,
        observations: edit.observations,
        activities: edit.activities
      })
      alert('Reporte guardado')
      await loadReports()
      const updated = (await api.get(`/brigadista/reports/${selectedReport.id}`)).data.data
      openModal(updated)
    } catch (error) {
      console.error('Error al guardar:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al guardar')
    }
  }

  const submit = async () => {
    if (!selectedReport) return
    try {
      await api.post(`/brigadista/reports/${selectedReport.id}/submit`)
      alert('Reporte enviado a revisión')
      closeModal()
      loadReports()
    } catch (error) {
      console.error('Error al enviar:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al enviar')
    }
  }

  const upload = async () => {
    if (!selectedReport || !fileToUpload) return
    try {
      const fd = new FormData()
      fd.append('file', fileToUpload)
      await api.post(`/brigadista/reports/${selectedReport.id}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Archivo subido')
      setFileToUpload(null)
      const updated = (await api.get(`/brigadista/reports/${selectedReport.id}`)).data.data
      openModal(updated)
    } catch (error) {
      console.error('Error al subir archivo:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al subir archivo')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando mis reportes...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📋 Mis reportes</h1>
        <p className="subtitle">Elabora, envía y corrige reportes asignados por tu supervisor</p>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Nuevo Reporte
        </button>
      </div>

      <div className="filters-card card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Estado</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="all">Todos</option>
              <option value="ASIGNADO">Asignado</option>
              <option value="EN_ELABORACION">En elaboración</option>
              <option value="ENVIADO">Enviado</option>
              <option value="OBSERVADO">Con observaciones</option>
              <option value="APROBADO">Aprobado</option>
            </select>
          </div>
        </div>
        <div className="filter-summary">
          Mostrando {filtered.length} de {reports.length} reportes
        </div>
      </div>

      <div className="reports-grid">
        {filtered.length === 0 ? (
          <div className="empty-state card">
            <p>No hay reportes para mostrar</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="report-card card">
              <div className="report-card-header">
                <div className="student-info">
                  <div className="student-avatar">R</div>
                  <div>
                    <h3>{r.title}</h3>
                    <p className="student-email">
                      Vence: {r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-MX') : '-'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${statusBadge(r.status).class}`}>{statusBadge(r.status).text}</span>
              </div>

              <div className="report-details">
                <div className="detail-row">
                  <span className="detail-label">Supervisor:</span>
                  <span className="detail-value">{r.supervisor?.fullName || r.supervisor?.username || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Versión:</span>
                  <span className="detail-value">{r.version}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Actividades:</span>
                  <span className="detail-value">{Array.isArray(r.activities) ? r.activities.length : 0}</span>
                </div>
              </div>

              {r.status === 'OBSERVADO' && r.reviewComments && (
                <div className="review-comments">
                  <strong>Observaciones del supervisor</strong>
                  <p>{r.reviewComments}</p>
                </div>
              )}

              <div className="report-actions">
                <button className="btn btn-outline" onClick={() => openModal(r)}>
                  ✏️ Abrir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Reporte</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="review-section">
                <label>Título *</label>
                <input
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="Título del reporte"
                />
              </div>
              <div className="review-section">
                <label>Descripción</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  rows="3"
                  placeholder="Descripción del reporte..."
                />
              </div>
              <div className="grid grid-2">
                <div className="review-section">
                  <label>Fecha límite *</label>
                  <input
                    type="date"
                    value={newReport.dueDate}
                    onChange={(e) => setNewReport({ ...newReport, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="review-section">
                  <label>Inicio del período</label>
                  <input
                    type="date"
                    value={newReport.periodStart}
                    onChange={(e) => setNewReport({ ...newReport, periodStart: e.target.value })}
                  />
                </div>
                <div className="review-section">
                  <label>Fin del período</label>
                  <input
                    type="date"
                    value={newReport.periodEnd}
                    onChange={(e) => setNewReport({ ...newReport, periodEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createReport} disabled={creating}>
                {creating ? 'Creando...' : 'Crear Reporte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar / enviar reporte</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="report-full-details">
                <h3>{selectedReport.title}</h3>
                <p><strong>Estado:</strong> <span className={`badge ${statusBadge(selectedReport.status).class}`}>{statusBadge(selectedReport.status).text}</span></p>
                <p><strong>Fecha límite:</strong> {selectedReport.dueDate ? new Date(selectedReport.dueDate).toLocaleDateString('es-MX') : '-'}</p>
                <p><strong>Supervisor:</strong> {selectedReport.supervisor?.fullName || selectedReport.supervisor?.username || '-'}</p>
              </div>

              {selectedReport.status === 'OBSERVADO' && reviewComments && (
                <div className="review-comments">
                  <strong>Observaciones</strong>
                  <p>{reviewComments}</p>
                </div>
              )}

              <div className="review-section">
                <label>Descripción</label>
                <textarea
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="review-section">
                <label>Observaciones del brigadista</label>
                <textarea
                  value={edit.observations}
                  onChange={(e) => setEdit({ ...edit, observations: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="review-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <label style={{ marginBottom: 0 }}>Actividades</label>
                  <button type="button" className="btn btn-outline" onClick={addActivity}>
                    + Agregar actividad
                  </button>
                </div>

                {edit.activities.length === 0 ? (
                  <p style={{ marginTop: 12 }}>Aún no registras actividades.</p>
                ) : (
                  <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                    {edit.activities.map((a, idx) => (
                      <div key={idx} className="objective-item">
                        <div className="grid grid-2">
                          <div>
                            <label>Fecha</label>
                            <input
                              type="date"
                              value={(a.date || '').slice(0, 10)}
                              onChange={(e) => updateActivity(idx, 'date', e.target.value)}
                            />
                          </div>
                          <div>
                            <label>Lugar</label>
                            <input
                              value={a.location || ''}
                              onChange={(e) => updateActivity(idx, 'location', e.target.value)}
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label>Descripción</label>
                            <input
                              value={a.description || ''}
                              onChange={(e) => updateActivity(idx, 'description', e.target.value)}
                              placeholder="Qué se hizo..."
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label>Hallazgos</label>
                            <input
                              value={a.findings || ''}
                              onChange={(e) => updateActivity(idx, 'findings', e.target.value)}
                              placeholder="Resultados / hallazgos..."
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                          <button type="button" className="btn btn-danger" onClick={() => removeActivity(idx)}>
                            🗑️ Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="review-section">
                <label>Adjuntos (evidencias)</label>
                <div className="grid grid-2">
                  <div>
                    <input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" className="btn btn-primary" disabled={!fileToUpload} onClick={upload}>
                      Subir archivo
                    </button>
                  </div>
                </div>
                {Array.isArray(selectedReport.attachments) && selectedReport.attachments.length > 0 && (
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    {selectedReport.attachments.map(att => (
                      <div key={att.id} className="detail-row" style={{ padding: 0 }}>
                        <span className="detail-label">{att.originalName}</span>
                        <span className="detail-value">{Math.round((att.size || 0) / 1024)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={save} disabled={selectedReport.status === 'ENVIADO' || selectedReport.status === 'APROBADO'}>
                Guardar
              </button>
              <button
                className="btn btn-success"
                onClick={submit}
                disabled={!(selectedReport.status === 'EN_ELABORACION' || selectedReport.status === 'OBSERVADO')}
              >
                Enviar a revisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrigadistaReports

