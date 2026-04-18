import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useSocket } from '../context/SocketContext'
import './AdminReports.css'

const emptyForm = { username: '', email: '', password: '', fullName: '', zone: '', team: '', community: '' }

function SupervisorBrigadistas() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrigadista, setEditingBrigadista] = useState(null)
  const [filters, setFilters] = useState({ search: '', community: '', groupBy: 'community' })
  const [form, setForm] = useState(emptyForm)
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })
  const { onlineUsers } = useSocket()

  useEffect(() => { loadBrigadistas() }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar brigadistas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Comunidades únicas para el filtro
  const communities = useMemo(() => {
    const set = new Set(brigadistas.map(b => b.brigadistaProfile?.community || 'Sin comunidad'))
    return ['', ...Array.from(set).sort()]
  }, [brigadistas])

  const filtered = useMemo(() => {
    const s = (filters.search || '').toLowerCase().trim()
    return brigadistas.filter(b => {
      const zone = b.brigadistaProfile?.zone || ''
      const team = b.brigadistaProfile?.team || ''
      const community = b.brigadistaProfile?.community || ''
      const matchSearch = !s || (
        (b.fullName || '').toLowerCase().includes(s) ||
        (b.username || '').toLowerCase().includes(s) ||
        (b.email || '').toLowerCase().includes(s) ||
        zone.toLowerCase().includes(s) ||
        team.toLowerCase().includes(s) ||
        community.toLowerCase().includes(s)
      )
      const matchCommunity = !filters.community || community === filters.community
      return matchSearch && matchCommunity
    })
  }, [brigadistas, filters.search, filters.community])

  // Agrupar por comunidad
  const grouped = useMemo(() => {
    if (filters.groupBy !== 'community') return null
    return filtered.reduce((acc, b) => {
      const key = b.brigadistaProfile?.community || 'Sin comunidad'
      if (!acc[key]) acc[key] = []
      acc[key].push(b)
      return acc
    }, {})
  }, [filtered, filters.groupBy])

  const openCreate = () => {
    setEditingBrigadista(null)
    setForm(emptyForm)
    setFormMsg({ type: '', text: '' })
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditingBrigadista(b)
    setForm({
      username: b.username, email: b.email, password: '',
      fullName: b.fullName || '',
      zone: b.brigadistaProfile?.zone || '',
      team: b.brigadistaProfile?.team || '',
      community: b.brigadistaProfile?.community || ''
    })
    setFormMsg({ type: '', text: '' })
    setShowModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormMsg({ type: '', text: '' })
    try {
      if (editingBrigadista) {
        await api.put(`/supervisor/brigadistas/${editingBrigadista.id}`, {
          fullName: form.fullName, zone: form.zone, team: form.team, community: form.community
        })
        setFormMsg({ type: 'success', text: 'Brigadista actualizado' })
      } else {
        await api.post('/supervisor/brigadistas', form)
        setFormMsg({ type: 'success', text: 'Brigadista registrado exitosamente' })
      }
      setTimeout(() => { setShowModal(false); setForm(emptyForm); loadBrigadistas() }, 1000)
    } catch (error) {
      setFormMsg({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Error al guardar brigadista' })
    }
  }

  const deleteBrigadista = async (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/supervisor/brigadistas/${id}`)
      loadBrigadistas()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar brigadista')
    }
  }

  const BrigadistaRow = ({ b }) => {
    const stats = b.reportStats || {}
    const total = stats.total || 0
    const aprobado = stats.aprobado || 0
    const pct = total > 0 ? Math.round((aprobado / total) * 100) : 0
    const isOnline = onlineUsers instanceof Set ? onlineUsers.has(b.id) : false
    return (
      <tr>
        <td>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {isOnline && <span title="En línea" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />}
            {b.fullName || '-'}
          </span>
        </td>
        <td>{b.username}</td>
        <td>{b.email}</td>
        <td>{b.brigadistaProfile?.zone || '-'}</td>
        <td>{b.brigadistaProfile?.team || '-'}</td>
        <td>
          <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{b.status}</span>
        </td>
        <td>
          {total > 0 ? (
            <div style={{ minWidth: 130 }}>
              <div style={{ display: 'flex', gap: 4, fontSize: 11, marginBottom: 3, flexWrap: 'wrap' }}>
                {stats.asignado > 0 && <span title="Asignados" style={{ color: '#6366f1' }}>📋 {stats.asignado}</span>}
                {stats.enElaboracion > 0 && <span title="En elaboración" style={{ color: '#f59e0b' }}>✏️ {stats.enElaboracion}</span>}
                {stats.enviado > 0 && <span title="Enviados" style={{ color: '#3b82f6' }}>📤 {stats.enviado}</span>}
                {stats.observado > 0 && <span title="Con observaciones" style={{ color: '#ef4444' }}>⚠️ {stats.observado}</span>}
                {stats.aprobado > 0 && <span title="Aprobados" style={{ color: '#22c55e' }}>✅ {stats.aprobado}</span>}
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }} title={`${pct}% aprobados`}>
                <div style={{ width: `${pct}%`, background: '#22c55e', height: '100%', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{pct}% ({aprobado}/{total})</div>
            </div>
          ) : <span style={{ color: '#9ca3af', fontSize: 12 }}>Sin reportes</span>}
        </td>
        <td>{new Date(b.createdAt).toLocaleDateString('es-MX')}</td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(b)}>✏️</button>
            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => deleteBrigadista(b.id, b.fullName || b.username)}>🗑️</button>
          </div>
        </td>
      </tr>
    )
  }

  const TableHeader = () => (
    <thead>
      <tr>
        <th>Nombre</th><th>Usuario</th><th>Correo</th><th>Zona</th><th>Equipo</th>
        <th>Estado</th><th>Reportes</th><th>Registro</th><th>Acciones</th>
      </tr>
    </thead>
  )

  if (loading) return (
    <div className="loading-container"><div className="spinner"></div><p>Cargando brigadistas...</p></div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👥 Brigadistas</h1>
          <p className="subtitle">Registra y administra tu equipo por comunidad</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Registrar brigadista</button>
      </div>

      {/* Filtros */}
      <div className="filters-card card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar</label>
            <input type="text" placeholder="Nombre, usuario, correo, zona, equipo o comunidad..."
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
          <div className="filter-group">
            <label>Comunidad</label>
            <select value={filters.community} onChange={(e) => setFilters({ ...filters, community: e.target.value })}>
              <option value="">Todas las comunidades</option>
              {communities.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Vista</label>
            <select value={filters.groupBy} onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}>
              <option value="community">Agrupar por comunidad</option>
              <option value="flat">Lista plana</option>
            </select>
          </div>
        </div>
        <div className="filter-summary">
          Mostrando {filtered.length} de {brigadistas.length} brigadistas
          {filters.community && <span style={{ marginLeft: 8, color: '#6366f1', fontWeight: 600 }}>— Comunidad: {filters.community}</span>}
        </div>
      </div>

      {/* Tabla agrupada por comunidad */}
      {filtered.length === 0 ? (
        <div className="empty-state card"><p>No hay brigadistas para mostrar</p></div>
      ) : filters.groupBy === 'community' && grouped ? (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([community, members]) => (
          <div key={community} className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🏘️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{community}</h3>
                  <span style={{ fontSize: 12, color: '#718096' }}>{members.length} brigadista{members.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#718096' }}>
                <span>✅ {members.reduce((s, b) => s + (b.reportStats?.aprobado || 0), 0)} aprobados</span>
                <span>📤 {members.reduce((s, b) => s + (b.reportStats?.enviado || 0), 0)} enviados</span>
                <span>📋 {members.reduce((s, b) => s + (b.reportStats?.total || 0), 0)} total</span>
              </div>
            </div>
            <div className="reports-table">
              <table>
                <TableHeader />
                <tbody>{members.map(b => <BrigadistaRow key={b.id} b={b} />)}</tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="card">
          <div className="reports-table">
            <table>
              <TableHeader />
              <tbody>{filtered.map(b => <BrigadistaRow key={b.id} b={b} />)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBrigadista ? 'Editar brigadista' : 'Registrar brigadista'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formMsg.text && (
                <div className={formMsg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 12 }}>
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={submit} className="grid grid-2">
                {!editingBrigadista && (
                  <>
                    <div><label>Usuario *</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
                    <div><label>Correo *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div><label>Contraseña *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                  </>
                )}
                <div><label>Nombre completo</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div><label>Comunidad</label><input value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })} placeholder="Ej. Comunidad San Juan" /></div>
                <div><label>Zona</label><input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Ej. Norte" /></div>
                <div><label>Equipo</label><input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Ej. Alpha" /></div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingBrigadista ? 'Guardar cambios' : 'Registrar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupervisorBrigadistas
