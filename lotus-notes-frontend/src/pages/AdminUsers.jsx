import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const ROLE_LABELS = { admin: 'Admin', supervisor: 'Supervisor', brigadista: 'Brigadista', student: 'Estudiante' }
const TABS = ['Todos', 'Supervisores', 'Brigadistas', 'Estudiantes']
const TAB_ROLES = { Todos: null, Supervisores: 'supervisor', Brigadistas: 'brigadista', Estudiantes: 'student' }
const ROLES = ['admin', 'supervisor', 'brigadista', 'student']

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Todos')
  const [search, setSearch] = useState('')
  const [pageMsg, setPageMsg] = useState({ type: '', text: '' })
  const [togglingId, setTogglingId] = useState(null)
  const [changingRoleId, setChangingRoleId] = useState(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data || [])
    } catch (err) {
      setPageMsg({ type: 'error', text: err.response?.data?.message || 'Error al cargar usuarios' })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    setTogglingId(user.id)
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      setPageMsg({ type: 'success', text: `Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}` })
      setTimeout(() => setPageMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setPageMsg({ type: 'error', text: err.response?.data?.message || 'Error al actualizar estado' })
    } finally {
      setTogglingId(null)
    }
  }

  const changeRole = async (userId, newRole) => {
    setChangingRoleId(userId)
    try {
      await api.put(`/admin/users/${userId}/status`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setPageMsg({ type: 'success', text: 'Rol actualizado' })
      setTimeout(() => setPageMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setPageMsg({ type: 'error', text: err.response?.data?.message || 'Error al cambiar rol' })
    } finally {
      setChangingRoleId(null)
    }
  }

  const filtered = useMemo(() => {
    const roleFilter = TAB_ROLES[activeTab]
    const s = search.toLowerCase().trim()
    return users.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false
      if (s) {
        return (
          (u.fullName || '').toLowerCase().includes(s) ||
          (u.username || '').toLowerCase().includes(s) ||
          (u.email || '').toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [users, activeTab, search])

  const getCommunity = (u) => {
    return u.brigadistaProfile?.community || u.supervisorProfile?.community || '-'
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👤 Gestión de Usuarios</h1>
          <p className="subtitle">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      {pageMsg.text && (
        <div className={pageMsg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 16 }}>
          {pageMsg.text}
          <button onClick={() => setPageMsg({ type: '', text: '' })} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="filters-card card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Nombre, usuario o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-summary">Mostrando {filtered.length} de {users.length} usuarios</div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Cargando usuarios...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card"><p>No hay usuarios para mostrar</p></div>
      ) : (
        <div className="card">
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Comunidad</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>{u.fullName || '-'}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={changingRoleId === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        style={{ width: 'auto', fontSize: 13, padding: '4px 8px' }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td>{getCommunity(u)}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {u.status === 'active' ? 'Activo' : u.status === 'inactive' ? 'Inactivo' : u.status}
                      </span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-MX') : '-'}</td>
                    <td>
                      <button
                        className={`btn ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        disabled={togglingId === u.id}
                        onClick={() => toggleStatus(u)}
                      >
                        {togglingId === u.id ? '...' : u.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
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

export default AdminUsers
