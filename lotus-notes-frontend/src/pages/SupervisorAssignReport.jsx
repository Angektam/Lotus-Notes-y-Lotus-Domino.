import { useEffect, useRef, useState, useMemo } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const emptyForm = { title: '', description: '', dueDate: '', periodStart: '', periodEnd: '' }
const today = new Date().toISOString().split('T')[0]

function SupervisorAssignReport() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [parsedExtra, setParsedExtra] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [filterCommunity, setFilterCommunity] = useState('')
  const fileRef = useRef()

  useEffect(() => { loadBrigadistas() }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch {
      setFormError('No se pudieron cargar los brigadistas')
    } finally {
      setLoading(false)
    }
  }

  // Comunidades únicas
  const communities = useMemo(() => {
    const s = new Set(brigadistas.map(b => b.brigadistaProfile?.community || 'Sin comunidad'))
    return ['', ...Array.from(s).sort()]
  }, [brigadistas])

  // Brigadistas filtrados
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return brigadistas.filter(b => {
      const matchSearch = !q || (b.fullName || '').toLowerCase().includes(q) || (b.username || '').toLowerCase().includes(q)
      const matchCom = !filterCommunity || (b.brigadistaProfile?.community || 'Sin comunidad') === filterCommunity
      return matchSearch && matchCom
    })
  }, [brigadistas, search, filterCommunity])

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const allIds = filtered.map(b => b.id)
    const allSelected = allIds.every(id => selectedIds.includes(id))
    setSelectedIds(allSelected ? selectedIds.filter(id => !allIds.includes(id)) : [...new Set([...selectedIds, ...allIds])])
  }

  const handleDocUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/pdf']
    if (!allowed.includes(file.type) && !file.name.match(/\.(docx|doc|pdf)$/i)) {
      setFormError('Solo se aceptan archivos DOCX, DOC o PDF')
      fileRef.current.value = ''
      return
    }
    setParsing(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('document', file)
      const res = await api.post('/supervisor/parse-report', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const d = res.data.data
      setForm(prev => ({
        ...prev,
        title: d.title || prev.title,
        description: d.description || prev.description,
        periodStart: d.periodStart || prev.periodStart,
        periodEnd: d.periodEnd || prev.periodEnd
      }))
      setParsedExtra(d)
      setSuccessMsg('Documento procesado. Revisa y completa los campos.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al procesar el documento')
    } finally {
      setParsing(false)
      fileRef.current.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (selectedIds.length === 0) { setFormError('Selecciona al menos un brigadista'); return }
    if (!form.title.trim()) { setFormError('El título es obligatorio'); return }
    if (!form.dueDate) { setFormError('La fecha límite es obligatoria'); return }
    if (form.dueDate < today) { setFormError('La fecha límite no puede ser en el pasado'); return }
    if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
      setFormError('La fecha de fin del período no puede ser anterior al inicio'); return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/supervisor/reports/assign-bulk', {
        brigadistaIds: selectedIds,
        ...form
      })
      setSuccessMsg(res.data.message)
      setForm(emptyForm)
      setSelectedIds([])
      setParsedExtra(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error al asignar reportes')
    } finally {
      setSubmitting(false)
    }
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(b => selectedIds.includes(b.id))

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📌 Asignar reporte</h1>
        <p className="subtitle">Asigna el mismo reporte a uno o varios brigadistas</p>
      </div>

      {formError && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {formError}
          <button onClick={() => setFormError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {successMsg && <div className="success-message" style={{ marginBottom: 16 }}>{successMsg}</div>}

      {/* Importar desde documento */}
      <div className="card" style={{ marginBottom: 20, background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: 15 }}>📄 Importar desde documento</p>
            <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>Sube un DOCX o PDF para pre-llenar el formulario automáticamente.</p>
          </div>
          <label className={`btn btn-outline ${parsing ? 'disabled' : ''}`} style={{ cursor: parsing ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            {parsing ? '⏳ Procesando...' : '📂 Subir documento'}
            <input ref={fileRef} type="file" accept=".docx,.doc,.pdf" onChange={handleDocUpload} disabled={parsing} style={{ display: 'none' }} />
          </label>
        </div>
        {parsedExtra && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0', fontSize: 13, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
            {parsedExtra.proyecto && <div><span style={{ color: '#718096' }}>Proyecto:</span> <strong>{parsedExtra.proyecto}</strong></div>}
            {parsedExtra.unidadReceptora && <div><span style={{ color: '#718096' }}>Unidad:</span> <strong>{parsedExtra.unidadReceptora}</strong></div>}
            {parsedExtra.numInforme && <div><span style={{ color: '#718096' }}>No. Informe:</span> <strong>{parsedExtra.numInforme}</strong></div>}
            {parsedExtra.horas > 0 && <div><span style={{ color: '#718096' }}>Horas:</span> <strong>{parsedExtra.horas}</strong></div>}
          </div>
        )}
      </div>

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* Panel izquierdo — selección de brigadistas */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>Brigadistas</h3>
                <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
                  {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                </span>
              </div>
              <input type="text" placeholder="Buscar brigadista..." value={search}
                onChange={e => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
              {communities.length > 2 && (
                <select value={filterCommunity} onChange={e => setFilterCommunity(e.target.value)} style={{ marginBottom: 0 }}>
                  <option value="">Todas las comunidades</option>
                  {communities.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {/* Seleccionar todos */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, background: allFilteredSelected ? '#eff6ff' : 'white' }}>
              <input type="checkbox" id="select-all-brig" checked={allFilteredSelected}
                onChange={toggleSelectAll} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="select-all-brig" style={{ cursor: 'pointer', fontSize: 14, fontWeight: 500, margin: 0 }}>
                Seleccionar todos ({filtered.length})
              </label>
            </div>

            {/* Lista */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Cargando...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Sin resultados</div>
              ) : (
                filtered.map(b => {
                  const selected = selectedIds.includes(b.id)
                  return (
                    <div key={b.id} onClick={() => toggleSelect(b.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f9fafb', background: selected ? '#eff6ff' : 'white', transition: 'background 0.1s' }}>
                      <input type="checkbox" checked={selected} onChange={() => toggleSelect(b.id)}
                        onClick={e => e.stopPropagation()} style={{ width: 15, height: 15, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: selected ? 600 : 400, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.fullName || b.username}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          {b.brigadistaProfile?.community || ''}{b.brigadistaProfile?.zone ? ` · ${b.brigadistaProfile.zone}` : ''}
                        </div>
                      </div>
                      {selected && <span style={{ color: '#6366f1', fontSize: 16 }}>✓</span>}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Panel derecho — datos del reporte */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Datos del reporte</h3>
            <div className="review-section">
              <label>Título *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Informe mensual — Inclusión Social" required />
            </div>
            <div className="review-section">
              <label>Descripción / Instrucciones</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Instrucciones, alcance, resultados esperados..." rows={4} />
            </div>
            <div className="grid grid-2">
              <div className="review-section">
                <label>Inicio del período</label>
                <input type="date" value={form.periodStart} onChange={e => setForm({ ...form, periodStart: e.target.value })} />
              </div>
              <div className="review-section">
                <label>Fin del período</label>
                <input type="date" value={form.periodEnd} min={form.periodStart || undefined} onChange={e => setForm({ ...form, periodEnd: e.target.value })} />
              </div>
            </div>
            <div className="review-section">
              <label>Fecha límite de entrega *</label>
              <input type="date" value={form.dueDate} min={today} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
            </div>

            {selectedIds.length > 0 && (
              <div style={{ background: '#eff6ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>
                Se asignará a <strong>{selectedIds.length}</strong> brigadista{selectedIds.length !== 1 ? 's' : ''}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {(selectedIds.length > 0 || parsedExtra) && (
                <button type="button" className="btn btn-secondary" onClick={() => { setForm(emptyForm); setSelectedIds([]); setParsedExtra(null) }}>
                  Limpiar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting || loading || selectedIds.length === 0}>
                {submitting ? 'Asignando...' : `Asignar a ${selectedIds.length || '...'} brigadista${selectedIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SupervisorAssignReport
