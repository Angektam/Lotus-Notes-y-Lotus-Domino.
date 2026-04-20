import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const today = new Date().toISOString().split('T')[0]

function BrigadistaReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all' })
  const [pageMsg, setPageMsg] = useState({ type: '', text: '' })

  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const [edit, setEdit] = useState({ description: '', observations: '', activities: [] })
  const [reviewComments, setReviewComments] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)

  const [showHistory, setShowHistory] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const emptyNew = {
    // Encabezado
    lugar: '', fecha: '',
    // Datos del brigadista
    unidadAcademica: '', licenciatura: '', numeroCuenta: '', nombreBrigadista: '',
    // Datos unidad receptora
    unidadReceptora: '', projectName: '', modalidad: '',
    // Periodo e informe
    periodStart: '', periodEnd: '', dueDate: '', numInforme: '', totalHours: '',
    // Secciones
    objectives: [{ objective: '', goals: '', activities: '' }],
    resultados: '',
    participants: [{ activity: '', count: '' }],
    observations: '',
    evidences: [{ descripcion: '' }],
    title: ''
  }
  const [newReport, setNewReport] = useState(emptyNew)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const res = await api.get('/brigadista/reports')
      setReports(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar mis reportes:', error)
      setPageMsg({ type: 'error', text: 'Error al cargar reportes' })
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
    setModalMsg({ type: '', text: '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setReviewComments('')
    setFileToUpload(null)
    setShowHistory(false)
  }

  const printReport = () => {
    if (!selectedReport) return
    const r = selectedReport
    const brigadistaInfo = r.brigadistaInfo || {}
    
    const w = window.open('', '_blank')
    w.document.write(`
<html>
<head>
  <title>Informe Mensual de Servicio Social</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; color: #1a1a1a; }
    h1 { text-align: center; font-size: 18px; margin-bottom: 8px; text-transform: uppercase; }
    .header-info { text-align: center; font-size: 14px; margin-bottom: 20px; }
    h2 { font-size: 15px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; }
    p { margin: 4px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td, th { border: 1px solid #333; padding: 8px; font-size: 12px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .signature-line { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; }
    .signature-line div { text-align: center; width: 45%; }
    hr { border: none; border-top: 1px solid #333; margin: 30px 0; }
    ul { margin: 8px 0; padding-left: 20px; }
    li { font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <h1>Informe Mensual de Servicio Social</h1>
  <div class="header-info">
    <strong>Lugar:</strong> ${r.lugar || '-'} | <strong>Fecha:</strong> ${r.fecha ? new Date(r.fecha).toLocaleDateString('es-MX') : '-'}
  </div>

  <h2>I. DATOS DEL BRIGADISTA</h2>
  <p><strong>Unidad Académica:</strong> ${r.unidadAcademica || brigadistaInfo.academicUnit || '-'}</p>
  <p><strong>Licenciatura:</strong> ${r.licenciatura || brigadistaInfo.career || '-'}</p>
  <p><strong>Número de Cuenta:</strong> ${r.numeroCuenta || brigadistaInfo.accountNumber || '-'}</p>
  <p><strong>Nombre del Brigadista:</strong> ${r.nombreBrigadista || r.brigadista?.fullName || brigadistaInfo.studentName || '-'}</p>

  <h2>II. DATOS DE LA UNIDAD RECEPTORA</h2>
  <p><strong>Nombre de la Unidad Receptora:</strong> ${r.unidadReceptora || brigadistaInfo.dependencyName || '-'}</p>
  <p><strong>Nombre del Proyecto:</strong> ${r.projectName || '-'}</p>
  <p><strong>Modalidad:</strong> ${r.modalidad || brigadistaInfo.modalidad || '-'}</p>
  <p><strong>Período:</strong> ${r.periodStart ? new Date(r.periodStart).toLocaleDateString('es-MX') : '-'} al ${r.periodEnd ? new Date(r.periodEnd).toLocaleDateString('es-MX') : '-'}</p>
  <p><strong>Número de Informe:</strong> ${r.numInforme || brigadistaInfo.numInforme || '-'}</p>
  <p><strong>Horas Reportadas:</strong> ${r.totalHours || 0}</p>

  <h2>III. OBJETIVO, METAS Y ACTIVIDADES</h2>
  ${Array.isArray(r.objectives) && r.objectives.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Objetivo específico</th>
        <th>Metas</th>
        <th>Actividades</th>
      </tr>
    </thead>
    <tbody>
      ${r.objectives.map(obj => `
        <tr>
          <td>${obj.objective || '-'}</td>
          <td>${obj.goals || '-'}</td>
          <td>${obj.activities || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>Sin objetivos registrados</p>'}

  <h2>IV. RESULTADOS OBTENIDOS</h2>
  <p>${r.description || r.resultados || 'Sin resultados registrados'}</p>

  <h2>V. PARTICIPANTES Y/O BENEFICIADOS</h2>
  ${Array.isArray(r.participants) && r.participants.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Actividad</th>
        <th>No. de participantes</th>
      </tr>
    </thead>
    <tbody>
      ${r.participants.map(p => `
        <tr>
          <td>${p.activity || '-'}</td>
          <td>${p.count || 0}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>Sin participantes registrados</p>'}

  <h2>VI. OBSERVACIONES</h2>
  <p>${r.observations || 'Sin observaciones'}</p>

  <h2>VII. EVIDENCIAS DE TRABAJO</h2>
  ${Array.isArray(r.evidences) && r.evidences.length > 0 ? `
  <ul>
    ${r.evidences.map(ev => `<li>${typeof ev === 'string' ? ev : ev.descripcion || '-'}</li>`).join('')}
  </ul>
  ` : '<p>Sin evidencias registradas</p>'}

  <hr>
  <div class="signature-line">
    <div>
      _______________________________<br>
      Firma del Asesor
    </div>
    <div>
      _______________________________<br>
      Firma del Responsable
    </div>
  </div>
</body>
</html>
    `)
    w.document.close()
    w.print()
  }

  const createReport = async () => {
    setCreateError('')
    if (!newReport.unidadReceptora.trim()) { setCreateError('El nombre de la unidad receptora es obligatorio'); return }
    if (!newReport.projectName.trim()) { setCreateError('El nombre del proyecto es obligatorio'); return }
    if (!newReport.dueDate) { setCreateError('La fecha límite es obligatoria'); return }
    if (newReport.dueDate < today) { setCreateError('La fecha límite no puede ser en el pasado'); return }
    if (newReport.periodStart && newReport.periodEnd && newReport.periodEnd < newReport.periodStart) {
      setCreateError('La fecha de fin del período no puede ser anterior al inicio'); return
    }

    const title = newReport.title.trim() ||
      `${newReport.projectName} — Informe ${newReport.numInforme || ''}`.trim()

    setCreating(true)
    try {
      await api.post('/brigadista/reports', {
        title,
        description: newReport.resultados,
        dueDate: newReport.dueDate,
        periodStart: newReport.periodStart,
        periodEnd: newReport.periodEnd,
        lugar: newReport.lugar,
        fecha: newReport.fecha,
        unidadAcademica: newReport.unidadAcademica,
        licenciatura: newReport.licenciatura,
        numeroCuenta: newReport.numeroCuenta,
        unidadReceptora: newReport.unidadReceptora,
        projectName: newReport.projectName,
        modalidad: newReport.modalidad,
        numInforme: newReport.numInforme,
        totalHours: parseInt(newReport.totalHours) || 0,
        objectives: newReport.objectives.filter(o => o.objective.trim()),
        participants: newReport.participants.filter(p => p.activity.trim()),
        observations: newReport.observations,
        evidences: newReport.evidences.filter(e => e.descripcion.trim()).map(e => e.descripcion)
      })
      setShowCreateModal(false)
      setNewReport(emptyNew)
      setPageMsg({ type: 'success', text: 'Reporte creado exitosamente' })
      setTimeout(() => setPageMsg({ type: '', text: '' }), 4000)
      loadReports()
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Error al crear reporte')
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
    setActionLoading(true)
    try {
      await api.put(`/brigadista/reports/${selectedReport.id}`, {
        description: edit.description,
        observations: edit.observations,
        activities: edit.activities
      })
      setModalMsg({ type: 'success', text: 'Reporte guardado' })
      await loadReports()
      const updated = (await api.get(`/brigadista/reports/${selectedReport.id}`)).data.data
      openModal(updated)
    } catch (error) {
      console.error('Error al guardar:', error)
      setModalMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al guardar' })
    } finally {
      setActionLoading(false)
    }
  }

  const submit = async () => {
    if (!selectedReport) return
    setActionLoading(true)
    try {
      await api.post(`/brigadista/reports/${selectedReport.id}/submit`)
      setModalMsg({ type: 'success', text: 'Reporte enviado a revisión' })
      setTimeout(() => { closeModal(); loadReports() }, 1500)
    } catch (error) {
      console.error('Error al enviar:', error)
      setModalMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al enviar' })
    } finally {
      setActionLoading(false)
    }
  }

  const upload = async () => {
    if (!selectedReport || !fileToUpload) return
    setActionLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', fileToUpload)
      await api.post(`/brigadista/reports/${selectedReport.id}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setModalMsg({ type: 'success', text: 'Archivo subido' })
      setFileToUpload(null)
      const updated = (await api.get(`/brigadista/reports/${selectedReport.id}`)).data.data
      openModal(updated)
    } catch (error) {
      console.error('Error al subir archivo:', error)
      setModalMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al subir archivo' })
    } finally {
      setActionLoading(false)
    }
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

      {pageMsg.text && (
        <div className={pageMsg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 16 }}>
          {pageMsg.text}
          <button onClick={() => setPageMsg({ type: '', text: '' })} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

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
        {loading ? (
          <div className="loading-container"><div className="spinner"></div><p>Cargando mis reportes...</p></div>
        ) : filtered.length === 0 ? (
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
          <div className="modal-content" style={{ maxWidth: 780 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Informe Mensual</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {createError && <div className="error-message" style={{ marginBottom: 12 }}>{createError}</div>}

              {/* Encabezado */}
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div className="grid grid-2">
                  <div className="review-section">
                    <label>Lugar</label>
                    <input value={newReport.lugar} onChange={e => setNewReport({ ...newReport, lugar: e.target.value })} placeholder="Ej. Los Mochis, Sinaloa" />
                  </div>
                  <div className="review-section">
                    <label>Fecha</label>
                    <input type="date" value={newReport.fecha} onChange={e => setNewReport({ ...newReport, fecha: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* I. Datos del Brigadista */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  I. Datos del Brigadista
                </h3>
                <div className="grid grid-2">
                  <div className="review-section">
                    <label>Unidad Académica</label>
                    <input value={newReport.unidadAcademica} onChange={e => setNewReport({ ...newReport, unidadAcademica: e.target.value })} placeholder="Ej. Facultad de Ingeniería Mochis" />
                  </div>
                  <div className="review-section">
                    <label>Licenciatura</label>
                    <input value={newReport.licenciatura} onChange={e => setNewReport({ ...newReport, licenciatura: e.target.value })} placeholder="Ej. Ingeniería de Software" />
                  </div>
                  <div className="review-section">
                    <label>Número de Cuenta</label>
                    <input value={newReport.numeroCuenta} onChange={e => setNewReport({ ...newReport, numeroCuenta: e.target.value })} placeholder="Ej. 2115164-4" />
                  </div>
                  <div className="review-section">
                    <label>Nombre del Brigadista</label>
                    <input value={newReport.nombreBrigadista} onChange={e => setNewReport({ ...newReport, nombreBrigadista: e.target.value })} placeholder="Nombre completo" />
                  </div>
                </div>
              </div>

              {/* II. Datos de la Unidad Receptora */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  II. Datos de la Unidad Receptora
                </h3>
                <div className="grid grid-2">
                  <div className="review-section" style={{ gridColumn: '1 / -1' }}>
                    <label>Nombre de la Unidad Receptora *</label>
                    <input value={newReport.unidadReceptora} onChange={e => setNewReport({ ...newReport, unidadReceptora: e.target.value })} placeholder="Ej. Módulo de Atención Comunitario Paredones" required />
                  </div>
                  <div className="review-section" style={{ gridColumn: '1 / -1' }}>
                    <label>Nombre del Proyecto *</label>
                    <input value={newReport.projectName} onChange={e => setNewReport({ ...newReport, projectName: e.target.value })} placeholder="Ej. Inclusión Social Comunitaria" required />
                  </div>
                  <div className="review-section">
                    <label>Modalidad</label>
                    <select value={newReport.modalidad} onChange={e => setNewReport({ ...newReport, modalidad: e.target.value })}>
                      <option value="">Selecciona...</option>
                      <option value="Multidisciplinaria">Multidisciplinaria</option>
                      <option value="Individual">Individual</option>
                      <option value="Comunitaria">Comunitaria</option>
                    </select>
                  </div>
                  <div className="review-section">
                    <label>Número de Informe</label>
                    <input type="number" min="1" value={newReport.numInforme} onChange={e => setNewReport({ ...newReport, numInforme: e.target.value })} placeholder="Ej. 2" />
                  </div>
                  <div className="review-section">
                    <label>Período — Inicio</label>
                    <input type="date" value={newReport.periodStart} onChange={e => setNewReport({ ...newReport, periodStart: e.target.value })} />
                  </div>
                  <div className="review-section">
                    <label>Período — Fin</label>
                    <input type="date" value={newReport.periodEnd} min={newReport.periodStart || undefined} onChange={e => setNewReport({ ...newReport, periodEnd: e.target.value })} />
                  </div>
                  <div className="review-section">
                    <label>Horas reportadas</label>
                    <input type="number" min="0" value={newReport.totalHours} onChange={e => setNewReport({ ...newReport, totalHours: e.target.value })} placeholder="Ej. 60" />
                  </div>
                  <div className="review-section">
                    <label>Fecha límite de entrega *</label>
                    <input type="date" value={newReport.dueDate} min={today} onChange={e => setNewReport({ ...newReport, dueDate: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* III. Objetivos, Metas y Actividades */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  III. Objetivo, Metas y Actividades
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: 'white' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '33%' }}>Objetivo específico</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '33%' }}>Metas</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '33%' }}>Actividades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newReport.objectives.map((obj, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 6 }}><textarea rows={2} style={{ width: '100%', fontSize: 13, resize: 'vertical', border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} value={obj.objective} onChange={e => { const o = [...newReport.objectives]; o[idx].objective = e.target.value; setNewReport({ ...newReport, objectives: o }) }} /></td>
                        <td style={{ padding: 6 }}><textarea rows={2} style={{ width: '100%', fontSize: 13, resize: 'vertical', border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} value={obj.goals} onChange={e => { const o = [...newReport.objectives]; o[idx].goals = e.target.value; setNewReport({ ...newReport, objectives: o }) }} /></td>
                        <td style={{ padding: 6, display: 'flex', gap: 4 }}>
                          <textarea rows={2} style={{ flex: 1, fontSize: 13, resize: 'vertical', border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} value={obj.activities} onChange={e => { const o = [...newReport.objectives]; o[idx].activities = e.target.value; setNewReport({ ...newReport, objectives: o }) }} />
                          {newReport.objectives.length > 1 && <button type="button" onClick={() => setNewReport({ ...newReport, objectives: newReport.objectives.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, alignSelf: 'flex-start' }}>✕</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn btn-outline" style={{ marginTop: 8, fontSize: 13 }}
                  onClick={() => setNewReport({ ...newReport, objectives: [...newReport.objectives, { objective: '', goals: '', activities: '' }] })}>
                  + Agregar fila
                </button>
              </div>

              {/* IV. Resultados obtenidos */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  IV. Resultados obtenidos
                </h3>
                <textarea rows={5} style={{ width: '100%', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, resize: 'vertical' }}
                  value={newReport.resultados} onChange={e => setNewReport({ ...newReport, resultados: e.target.value })}
                  placeholder="Describe los resultados obtenidos durante el período..." />
              </div>

              {/* V. Participantes y/o beneficiados */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  V. Participantes y/o Beneficiados
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: 'white' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '70%' }}>Actividades</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>No. de participantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newReport.participants.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 6 }}><input style={{ width: '100%', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} value={p.activity} onChange={e => { const ps = [...newReport.participants]; ps[idx].activity = e.target.value; setNewReport({ ...newReport, participants: ps }) }} /></td>
                        <td style={{ padding: 6, display: 'flex', gap: 4 }}>
                          <input type="number" min="0" style={{ width: '80px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} value={p.count} onChange={e => { const ps = [...newReport.participants]; ps[idx].count = e.target.value; setNewReport({ ...newReport, participants: ps }) }} />
                          {newReport.participants.length > 1 && <button type="button" onClick={() => setNewReport({ ...newReport, participants: newReport.participants.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>✕</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn btn-outline" style={{ marginTop: 8, fontSize: 13 }}
                  onClick={() => setNewReport({ ...newReport, participants: [...newReport.participants, { activity: '', count: '' }] })}>
                  + Agregar fila
                </button>
              </div>

              {/* VI. Observaciones */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  VI. Observaciones
                </h3>
                <textarea rows={4} style={{ width: '100%', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, resize: 'vertical' }}
                  value={newReport.observations} onChange={e => setNewReport({ ...newReport, observations: e.target.value })}
                  placeholder="Observaciones generales del período..." />
              </div>

              {/* VII. Evidencias */}
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 6, marginBottom: 14 }}>
                  VII. Evidencias de trabajo
                </h3>
                {newReport.evidences.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input style={{ flex: 1, fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }}
                      value={ev.descripcion} onChange={e => { const evs = [...newReport.evidences]; evs[idx].descripcion = e.target.value; setNewReport({ ...newReport, evidences: evs }) }}
                      placeholder={`Descripción de evidencia ${idx + 1}`} />
                    {newReport.evidences.length > 1 && <button type="button" onClick={() => setNewReport({ ...newReport, evidences: newReport.evidences.filter((_, i) => i !== idx) })} className="btn btn-danger" style={{ padding: '6px 10px' }}>✕</button>}
                  </div>
                ))}
                <button type="button" className="btn btn-outline" style={{ fontSize: 13 }}
                  onClick={() => setNewReport({ ...newReport, evidences: [...newReport.evidences, { descripcion: '' }] })}>
                  + Agregar evidencia
                </button>
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
              <div id="report-print-content">
              <div className="report-full-details">
                <h3>{selectedReport.title}</h3>
                <p><strong>Estado:</strong> <span className={`badge ${statusBadge(selectedReport.status).class}`}>{statusBadge(selectedReport.status).text}</span></p>
                <p><strong>Fecha límite:</strong> {selectedReport.dueDate ? new Date(selectedReport.dueDate).toLocaleDateString('es-MX') : '-'}</p>
                <p><strong>Supervisor:</strong> {selectedReport.supervisor?.fullName || selectedReport.supervisor?.username || '-'}</p>
                {selectedReport.description && <p><strong>Descripción:</strong> {selectedReport.description}</p>}
                {Array.isArray(selectedReport.activities) && selectedReport.activities.length > 0 && (
                  <div className="section" style={{ marginTop: 12 }}>
                    <strong>Actividades</strong>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                      <thead><tr><th style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>Fecha</th><th style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>Lugar</th><th style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>Descripción</th><th style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>Hallazgos</th></tr></thead>
                      <tbody>{selectedReport.activities.map((a, i) => (
                        <tr key={i}><td style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>{a.date ? new Date(a.date).toLocaleDateString('es-MX') : '-'}</td><td style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>{a.location || '-'}</td><td style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>{a.description || '-'}</td><td style={{ border: '1px solid #ddd', padding: 6, fontSize: 12 }}>{a.findings || '-'}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
                {selectedReport.observations && <p style={{ marginTop: 8 }}><strong>Observaciones:</strong> {selectedReport.observations}</p>}
                {Array.isArray(selectedReport.attachments) && selectedReport.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Adjuntos:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>{selectedReport.attachments.map(att => <li key={att.id} style={{ fontSize: 13 }}>{att.originalName}</li>)}</ul>
                  </div>
                )}
              </div>
              </div>

              {/* Historial de workflow */}
              {Array.isArray(selectedReport.workflowHistory) && selectedReport.workflowHistory.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 13, padding: '6px 14px' }}
                    onClick={() => setShowHistory(h => !h)}
                  >
                    {showHistory ? 'Ocultar historial' : 'Ver historial'}
                  </button>
                  {showHistory && (
                    <div style={{ marginTop: 12, paddingLeft: 8, borderLeft: '3px solid #e5e7eb' }}>
                      {selectedReport.workflowHistory.map((entry, idx) => {
                        const badge = statusBadge(entry.state)
                        return (
                          <div key={idx} style={{ position: 'relative', paddingLeft: 20, paddingBottom: 16 }}>
                            <div style={{ position: 'absolute', left: -9, top: 4, width: 14, height: 14, borderRadius: '50%', background: '#6366f1', border: '2px solid #fff', boxShadow: '0 0 0 2px #6366f1' }} />
                            <div style={{ fontSize: 12, color: '#718096', marginBottom: 2 }}>
                              {entry.date ? new Date(entry.date).toLocaleString('es-MX') : '-'}
                            </div>
                            <span className={`badge ${badge.class}`} style={{ fontSize: 11 }}>{badge.text}</span>
                            {entry.comments && (
                              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4a5568' }}>{entry.comments}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {modalMsg.text && (
                <div className={modalMsg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 12 }}>
                  {modalMsg.text}
                </div>
              )}

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
              <button className="btn btn-secondary" onClick={closeModal} disabled={actionLoading}>Cerrar</button>
              <button className="btn btn-outline" onClick={printReport}>🖨️ Descargar PDF</button>
              <button className="btn btn-primary" onClick={save} disabled={actionLoading || selectedReport.status === 'ENVIADO' || selectedReport.status === 'APROBADO'}>
                {actionLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button className="btn btn-success" onClick={submit} disabled={actionLoading || !(selectedReport.status === 'EN_ELABORACION' || selectedReport.status === 'OBSERVADO')}>
                {actionLoading ? 'Enviando...' : 'Enviar a revisión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrigadistaReports

