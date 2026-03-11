import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

function SupervisorBrigadistas() {
  const [brigadistas, setBrigadistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({ search: '' })
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    zone: '',
    team: ''
  })

  useEffect(() => {
    loadBrigadistas()
  }, [])

  const loadBrigadistas = async () => {
    try {
      const res = await api.get('/supervisor/brigadistas')
      setBrigadistas(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar brigadistas:', error)
      alert('Error al cargar brigadistas')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = (filters.search || '').toLowerCase().trim()
    if (!s) return brigadistas
    return brigadistas.filter(b => {
      const zone = b.brigadistaProfile?.zone || ''
      const team = b.brigadistaProfile?.team || ''
      return (
        (b.fullName || '').toLowerCase().includes(s) ||
        (b.username || '').toLowerCase().includes(s) ||
        (b.email || '').toLowerCase().includes(s) ||
        zone.toLowerCase().includes(s) ||
        team.toLowerCase().includes(s)
      )
    })
  }, [brigadistas, filters.search])

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      fullName: '',
      zone: '',
      team: ''
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/supervisor/brigadistas', form)
      alert('Brigadista registrado exitosamente')
      setShowModal(false)
      resetForm()
      loadBrigadistas()
    } catch (error) {
      console.error('Error al registrar brigadista:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al registrar brigadista')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando brigadistas...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👥 Brigadistas</h1>
        <p className="subtitle">Registra brigadistas y administra tu equipo</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Registrar brigadista
        </button>
      </div>

      <div className="filters-card card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nombre, usuario, correo, zona o equipo..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        <div className="filter-summary">
          Mostrando {filtered.length} de {brigadistas.length} brigadistas
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No hay brigadistas registrados</p>
          </div>
        ) : (
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Zona</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>{b.fullName || '-'}</td>
                    <td>{b.username}</td>
                    <td>{b.email}</td>
                    <td>{b.brigadistaProfile?.zone || '-'}</td>
                    <td>{b.brigadistaProfile?.team || '-'}</td>
                    <td>
                      <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{new Date(b.createdAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar brigadista</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submit} className="grid grid-2">
                <div>
                  <label>Usuario</label>
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div>
                  <label>Correo</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label>Contraseña</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div>
                  <label>Nombre completo</label>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                  <label>Zona</label>
                  <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Ej. Zona Norte" />
                </div>
                <div>
                  <label>Equipo</label>
                  <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Ej. Equipo A" />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm() }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar
                  </button>
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

