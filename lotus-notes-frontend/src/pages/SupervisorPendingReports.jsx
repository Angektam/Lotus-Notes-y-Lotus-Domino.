import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const SCORE_COLOR = (n) => n >= 8 ? '#22c55e' : n >= 5 ? '#f59e0b' : '#ef4444'

function SupervisorPendingReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewComments, setReviewComments] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' })
  // Structured feedback
  const [sectionFeedback, setSectionFeedback] = useState({ general: '', objetivos: '', resultados: '', participantes: '', observaciones: '', evidencias: '' })
  const [showStructured, setShowStructured] = useState(false)
  // IA
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  useEffect(() => { loadPending() }, [])

  const loadPending = async () => {
    setLoading(true)
    try {
      const res = await api.get('/supervisor/reports/pending')
      setReports(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar pendientes:', error)
      setActionMsg({ type: 'error', text: 'Error al cargar reportes pendientes' })
    } finally {
      setLoading(false)
    }
  }

  const openModal = (report) => {
    setSelectedReport(report)
    setReviewComments(report.reviewComments || '')
    setActionMsg({ type: '', text: '' })
    setAiResult(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setReviewComments('')
    setSectionFeedback({ general: '', objetivos: '', resultados: '', participantes: '', observaciones: '', evidencias: '' })
    setShowStructured(false)
  }

  const approve = async (reportId) => {
    setActionLoading(true)
    try {
      await api.put(`/supervisor/reports/${reportId}/review`, { action: 'APPROVE', comments: reviewComments, observations: [] })
      setActionMsg({ type: 'success', text: 'Reporte aprobado' })
      closeModal()
      loadPending()
    } catch (error) {
      setActionMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al aprobar' })
    } finally {
      setActionLoading(false)
    }
  }

  const requestFixes = async (reportId) => {
    // Build combined comments from structured feedback or plain textarea
    let finalComments = reviewComments.trim()
    if (showStructured) {
      const parts = []
      if (sectionFeedback.objetivos.trim()) parts.push(`• Objetivos: ${sectionFeedback.objetivos.trim()}`)
      if (sectionFeedback.resultados.trim()) parts.push(`• Resultados: ${sectionFeedback.resultados.trim()}`)
      if (sectionFeedback.participantes.trim()) parts.push(`• Participantes: ${sectionFeedback.participantes.trim()}`)
      if (sectionFeedback.observaciones.trim()) parts.push(`• Observaciones: ${sectionFeedback.observaciones.trim()}`)
      if (sectionFeedback.evidencias.trim()) parts.push(`• Evidencias: ${sectionFeedback.evidencias.trim()}`)
      if (sectionFeedback.general.trim()) parts.push(`• General: ${sectionFeedback.general.trim()}`)
      if (parts.length > 0) {
        finalComments = `OBSERVACIONES POR SECCIÓN:\n${parts.join('\n')}`
      }
    }
    if (!finalComments) {
      setActionMsg({ type: 'error', text: 'Agrega comentarios para solicitar correcciones' })
      return
    }
    setActionLoading(true)
    try {
      await api.put(`/supervisor/reports/${reportId}/review`, { action: 'REJECT', comments: finalComments, observations: [] })
      setActionMsg({ type: 'success', text: 'Correcciones solicitadas' })
      closeModal()
      loadPending()
    } catch (error) {
      setActionMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al solicitar correcciones' })
    } finally {
      setActionLoading(false)
    }
  }

  const analyzeWithAI = async (reportId) => {
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await api.post(`/supervisor/reports/${reportId}/ai-analyze`)
      const data = res.data.data
      setAiResult(data)
      // Si la IA recomienda aprobar/observar, pre-llenar el comentario
      if (data.comentario && !reviewComments.trim()) {
        setReviewComments(data.comentario)
      }
    } catch (err) {
      setAiResult({ error: err.response?.data?.message || 'Error al contactar la IA' })
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔎 Pendientes de revisión</h1>
        <p className="subtitle">Reportes enviados por brigadistas</p>
      </div>

      {actionMsg.text && (
        <div className={actionMsg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 16 }}>
          {actionMsg.text}
          <button onClick={() => setActionMsg({ type: '', text: '' })} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="reports-grid">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div><p>Cargando reportes pendientes...</p></div>
        ) : reports.length === 0 ? (
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

                {/* I. Datos del brigadista */}
                {(selectedReport.unidadAcademica || selectedReport.licenciatura || selectedReport.numeroCuenta) && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>I. Datos del Brigadista</h4>
                    {selectedReport.unidadAcademica && <p><strong>Unidad Académica:</strong> {selectedReport.unidadAcademica}</p>}
                    {selectedReport.licenciatura && <p><strong>Licenciatura:</strong> {selectedReport.licenciatura}</p>}
                    {selectedReport.numeroCuenta && <p><strong>Número de Cuenta:</strong> {selectedReport.numeroCuenta}</p>}
                  </>
                )}

                {/* II. Datos de la unidad receptora */}
                {(selectedReport.unidadReceptora || selectedReport.projectName || selectedReport.modalidad) && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>II. Datos de la Unidad Receptora</h4>
                    {selectedReport.unidadReceptora && <p><strong>Unidad Receptora:</strong> {selectedReport.unidadReceptora}</p>}
                    {selectedReport.projectName && <p><strong>Proyecto:</strong> {selectedReport.projectName}</p>}
                    {selectedReport.modalidad && <p><strong>Modalidad:</strong> {selectedReport.modalidad}</p>}
                  </>
                )}

                {/* Período e informe */}
                {(selectedReport.periodStart || selectedReport.periodEnd || selectedReport.totalHours != null || selectedReport.numInforme) && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>Período e Informe</h4>
                    {selectedReport.periodStart && <p><strong>Inicio:</strong> {new Date(selectedReport.periodStart).toLocaleDateString('es-MX')}</p>}
                    {selectedReport.periodEnd && <p><strong>Fin:</strong> {new Date(selectedReport.periodEnd).toLocaleDateString('es-MX')}</p>}
                    {selectedReport.numInforme && <p><strong>Número de Informe:</strong> {selectedReport.numInforme}</p>}
                    {selectedReport.totalHours != null && <p><strong>Horas Reportadas:</strong> {selectedReport.totalHours}</p>}
                  </>
                )}

                {/* III. Objetivos */}
                {Array.isArray(selectedReport.objectives) && selectedReport.objectives.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>III. Objetivo, Metas y Actividades</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f0f4f8' }}>
                          <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>Objetivo</th>
                          <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>Metas</th>
                          <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>Actividades</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.objectives.map((obj, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{obj.objective || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{obj.goals || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{obj.activities || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* IV. Resultados */}
                {selectedReport.description && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>IV. Resultados Obtenidos</h4>
                    <p>{selectedReport.description}</p>
                  </>
                )}

                {/* V. Participantes */}
                {Array.isArray(selectedReport.participants) && selectedReport.participants.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>V. Participantes y/o Beneficiados</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f0f4f8' }}>
                          <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>Actividad</th>
                          <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>No. Participantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.participants.map((p, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{p.activity || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{p.count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* VI. Observaciones */}
                {selectedReport.observations && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>VI. Observaciones</h4>
                    <p>{selectedReport.observations}</p>
                  </>
                )}

                {/* VII. Evidencias */}
                {Array.isArray(selectedReport.evidences) && selectedReport.evidences.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>VII. Evidencias de Trabajo</h4>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {selectedReport.evidences.map((ev, idx) => (
                        <li key={idx} style={{ fontSize: 13 }}>{typeof ev === 'string' ? ev : ev.descripcion || '-'}</li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Actividades (legacy) */}
                {Array.isArray(selectedReport.activities) && selectedReport.activities.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>Actividades</h4>
                    {selectedReport.activities.map((a, idx) => (
                      <div key={idx} className="objective-item">
                        <p><strong>Fecha:</strong> {a.date ? new Date(a.date).toLocaleDateString('es-MX') : '-'}</p>
                        <p><strong>Descripción:</strong> {a.description || '-'}</p>
                        {a.location ? <p><strong>Lugar:</strong> {a.location}</p> : null}
                        {a.findings ? <p><strong>Hallazgos:</strong> {a.findings}</p> : null}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="review-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ marginBottom: 0 }}>Comentarios / Observaciones</label>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '4px 12px' }}
                    onClick={() => setShowStructured(s => !s)}
                  >
                    {showStructured ? '📝 Comentario simple' : '📋 Feedback por sección'}
                  </button>
                </div>
                {showStructured ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {[
                      { key: 'objetivos', label: 'Objetivos' },
                      { key: 'resultados', label: 'Resultados' },
                      { key: 'participantes', label: 'Participantes' },
                      { key: 'observaciones', label: 'Observaciones' },
                      { key: 'evidencias', label: 'Evidencias' },
                      { key: 'general', label: 'General' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>{label}</label>
                        <textarea
                          value={sectionFeedback[key]}
                          onChange={(e) => setSectionFeedback(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Observaciones sobre ${label.toLowerCase()}...`}
                          rows="2"
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Indica qué debe corregir o confirma aprobación..."
                    rows="4"
                  />
                )}
              </div>

              {/* Panel IA */}
              <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>🤖 Análisis con IA</span>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 14px', fontSize: 13 }}
                    onClick={() => analyzeWithAI(selectedReport.id)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? '⏳ Analizando...' : aiResult ? '🔄 Re-analizar' : '✨ Analizar reporte'}
                  </button>
                </div>

                {aiLoading && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#718096', fontSize: 14 }}>
                    <div className="spinner" style={{ margin: '0 auto 8px' }}></div>
                    Analizando el reporte con IA...
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div style={{ padding: 16 }}>
                    {aiResult.error ? (
                      <div className="error-message">{aiResult.error}</div>
                    ) : (
                      <>
                        {/* Puntuación y recomendación */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#718096' }}>Puntuación:</span>
                            <span style={{ fontSize: 22, fontWeight: 700, color: SCORE_COLOR(aiResult.puntuacion) }}>
                              {aiResult.puntuacion}/10
                            </span>
                          </div>
                          <span style={{
                            padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            background: aiResult.recomendacion === 'APROBAR' ? '#dcfce7' : '#fef3c7',
                            color: aiResult.recomendacion === 'APROBAR' ? '#16a34a' : '#d97706'
                          }}>
                            {aiResult.recomendacion === 'APROBAR' ? '✓ Recomendación: APROBAR' : '⚠ Recomendación: OBSERVAR'}
                          </span>
                        </div>

                        {/* Resumen */}
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Resumen:</p>
                          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{aiResult.resumen}</p>
                        </div>

                        {/* Observaciones */}
                        {aiResult.observaciones?.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Puntos a revisar:</p>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {aiResult.observaciones.map((o, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#4b5563', marginBottom: 4 }}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Botón para usar el comentario generado */}
                        {aiResult.comentario && (
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: 12, padding: '4px 12px' }}
                            onClick={() => setReviewComments(aiResult.comentario)}
                          >
                            Usar comentario generado por IA
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {!aiResult && !aiLoading && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                    Haz clic en "Analizar reporte" para obtener un resumen y recomendación automática.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={actionLoading}>Cancelar</button>
              <button className="btn btn-success" onClick={() => approve(selectedReport.id)} disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : '✓ Aceptar'}
              </button>
              <button className="btn btn-danger" onClick={() => requestFixes(selectedReport.id)} disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : '✕ Solicitar correcciones'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupervisorPendingReports

