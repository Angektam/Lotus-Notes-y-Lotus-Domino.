import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

function relativeTime(dateStr) {
  if (!dateStr) return '-'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `Activo hace ${diff}s`
  if (diff < 3600) return `Activo hace ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `Activo hace ${Math.floor(diff / 3600)}h`
  return `Activo hace ${Math.floor(diff / 86400)}d`
}

const ROLE_LABELS = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  brigadista: 'Brigadista',
  student: 'Estudiante',
}

function AdminAccessLog() {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/access-log')
      .then(r => setLog(r.data.data || []))
      .catch(() => setError('No se pudo cargar el registro de accesos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = log.filter(u => {
    const q = search.toLowerCase()
    return !q || u.fullName?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)
  })

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔐 Auditoría de Accesos</h1>
        <p className="subtitle">Últimos inicios de sesión por usuario</p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="filters-card card" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o usuario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 360, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14 }}
        />
        <div className="filter-summary" style={{ marginTop: 8 }}>
          Mostrando {filtered.length} de {log.length} registros
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Cargando registros...</p></div>
      ) : (
        <div className="card">
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Comunidad</th>
                  <th>Último acceso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>Sin registros</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.fullName || '-'}</strong></td>
                    <td>{u.username}</td>
                    <td><span className="badge badge-secondary">{ROLE_LABELS[u.role] || u.role}</span></td>
                    <td>{u.community || '-'}</td>
                    <td>
                      <span title={u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-MX') : '-'}>
                        {relativeTime(u.lastLogin)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {u.status === 'active' ? 'Activo' : u.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAccessLog
