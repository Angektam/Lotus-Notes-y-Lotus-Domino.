import { useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const STATUSES = ['ASIGNADO', 'EN_ELABORACION', 'ENVIADO', 'OBSERVADO', 'APROBADO']

const statusBadge = (status) => {
  const map = {
    ASIGNADO: 'badge-primary', EN_ELABORACION: 'badge-warning',
    ENVIADO: 'badge-warning', OBSERVADO: 'badge-danger', APROBADO: 'badge-success'
  }
  return map[status] || 'badge-secondary'
}

function SupervisorSearch() {
  const [filters, setFilters] = useState({ query: '', status: '', startDate: '', endDate: '' })
  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchMsg, setSearchMsg] = useState({ type: '', text: '' })

  const search = async (page = 1) => {
    setLoading(true)
    setSearched(true)
    try {
      const params = { page, limit: 20 }
      if (filters.query) params.query = filters.query
      if (filters.status) params.status = filters.status
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      const res = await api.get('/analytics/search', { params })
      setResults(res.data.reports || [])
      setPagination(res.data.pagination || null)
    } catch (err) {
      console.error('Error en búsqueda:', err)
      setSearchMsg({ type: 'error', text: 'Error al buscar reportes' })
    } finally {
      setLoading(false)
    }
  }

  const exportExcel = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      const res = await api.get('/analytics/export/excel', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `reportes_${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al exportar:', err)
      setSearchMsg({ type: 'error', text: 'Error al exportar' })
    } finally {
      setExporting(false)
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); search(1) }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 Búsqueda avanzada</h1>
        <p className="subtitle">Busca y filtra reportes de tus brigadistas</p>
      </div>

      {searchMsg.text && (
        <div className={searchMsg.type === 'error' ? 'error-message' : 'success-message'} style={{ marginBottom: 16 }}>
          {searchMsg.text}
          <button onClick={() => setSearchMsg({ type: '', text: '' })} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="filters-grid">
          <div className="filter-group">
            <label>Texto</label>
            <input
              type="text"
              placeholder="Buscar en título o descripción..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Estado</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Todos</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Desde</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="filter-group">
            <label>Hasta</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={exportExcel} disabled={exporting}>
              {exporting ? 'Exportando...' : '📥 Excel'}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="card" style={{ marginTop: 16 }}>
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : results.length === 0 ? (
            <div className="empty-state"><p>Sin resultados para los filtros aplicados</p></div>
          ) : (
            <>
              <div className="filter-summary" style={{ marginBottom: 12 }}>
                {pagination ? `${pagination.total} resultado(s) — página ${pagination.page} de ${pagination.totalPages}` : `${results.length} resultado(s)`}
              </div>
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Brigadista</th>
                      <th>Estado</th>
                      <th>Vence</th>
                      <th>Versión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id}>
                        <td>{r.title}</td>
                        <td>{r.brigadista?.fullName || r.brigadista?.username || '-'}</td>
                        <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                        <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-MX') : '-'}</td>
                        <td>{r.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => search(p)}
                      style={{ minWidth: 36 }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SupervisorSearch
