import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminReports.css'

const STATUS_LABELS = { active: 'Activo', inactive: 'Inactivo', away: 'Ausente' }
const STATUS_BADGE = { active: 'badge-success', inactive: 'badge-secondary', away: 'badge-warning' }

function BrigadistaProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState({ fullName: '', department: '', zone: '', team: '', community: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await api.get('/brigadista/profile')
      const data = res.data.data
      setProfile(data)
      setForm({
        fullName: data.fullName || '',
        department: data.department || '',
        zone: data.brigadistaProfile?.zone || '',
        team: data.brigadistaProfile?.team || '',
        community: data.brigadistaProfile?.community || ''
      })
    } catch (err) {
      setMsg({ type: 'error', text: 'No se pudo cargar el perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.fullName.trim()) { setMsg({ type: 'error', text: 'El nombre completo es obligatorio' }); return }
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      // Si hay cambio de contraseña, validar primero
      let payload = { ...form }
      if (showPwd) {
        if (!pwdForm.currentPassword) { setMsg({ type: 'error', text: 'Ingresa tu contraseña actual' }); setSaving(false); return }
        if (pwdForm.newPassword.length < 6) { setMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' }); setSaving(false); return }
        if (pwdForm.newPassword !== pwdForm.confirmPassword) { setMsg({ type: 'error', text: 'Las contraseñas no coinciden' }); setSaving(false); return }
        payload = { ...payload, currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }
      }
      await api.put('/brigadista/profile', payload)
      setMsg({ type: 'success', text: showPwd ? 'Perfil y contraseña actualizados' : 'Perfil actualizado correctamente' })
      setEditing(false)
      setShowPwd(false)
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      loadProfile()
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...user, fullName: form.fullName }))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="loading-container"><div className="spinner"></div><p>Cargando perfil...</p></div>
  )

  if (!profile) return (
    <div className="empty-state card"><p>No se pudo cargar el perfil</p></div>
  )

  const { stats } = profile
  const initials = (profile.fullName || profile.username || 'B').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const lastLogin = profile.lastLogin ? new Date(profile.lastLogin).toLocaleString('es-MX') : 'Nunca'

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👤 Mi Perfil</h1>
          <p className="subtitle">Información y estadísticas de tu cuenta</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => { setEditing(true); setMsg({ type: '', text: '' }) }}>
            ✏️ Editar perfil
          </button>
        )}
      </div>

      {msg.text && (
        <div className={msg.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: 16 }}>
          {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>

        {/* Tarjeta de avatar e info básica */}
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-color, #4f46e5)',
            color: 'white', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px'
          }}>
            {initials}
          </div>
          <h2 style={{ margin: '0 0 4px' }}>{profile.fullName || profile.username}</h2>
          <p style={{ color: '#718096', margin: '0 0 12px', fontSize: 14 }}>@{profile.username}</p>
          <span className={`badge ${STATUS_BADGE[profile.status] || 'badge-secondary'}`}>
            {STATUS_LABELS[profile.status] || profile.status}
          </span>
          <div style={{ marginTop: 20, fontSize: 13, color: '#718096', textAlign: 'left' }}>
            <p style={{ margin: '6px 0' }}>📧 {profile.email}</p>
            {profile.department && <p style={{ margin: '6px 0' }}>🏢 {profile.department}</p>}
            {profile.brigadistaProfile?.zone && <p style={{ margin: '6px 0' }}>📍 Zona {profile.brigadistaProfile.zone}</p>}
            {profile.brigadistaProfile?.team && <p style={{ margin: '6px 0' }}>👥 Equipo {profile.brigadistaProfile.team}</p>}
            {profile.brigadistaProfile?.community && <p style={{ margin: '6px 0' }}>🏘️ Comunidad: {profile.brigadistaProfile.community}</p>}
            <p style={{ margin: '6px 0' }}>📅 Miembro desde {memberSince}</p>
            <p style={{ margin: '6px 0' }}>🕐 Último acceso: {lastLogin}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Asignados', value: stats.totalReports, color: '#4f46e5', icon: '📋' },
              { label: 'Aprobados', value: stats.approved, color: '#22c55e', icon: '✅' },
              { label: 'Pendientes', value: stats.pending, color: '#f59e0b', icon: '📝' },
              { label: 'Vencidos', value: stats.overdue, color: '#ef4444', icon: '⚠️' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progreso */}
          {stats.totalReports > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Progreso general</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Reportes aprobados</span>
                <span style={{ fontWeight: 600 }}>{Math.round((stats.approved / stats.totalReports) * 100)}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.round((stats.approved / stats.totalReports) * 100)}%`,
                  background: '#22c55e', height: '100%', transition: 'width 0.4s'
                }} />
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                {stats.approved} de {stats.totalReports} reportes aprobados
              </p>
            </div>
          )}

          {/* Formulario de edición */}
          {editing && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Editar información</h3>
              <form onSubmit={handleSave} className="grid grid-2">
                <div>
                  <label>Nombre completo *</label>
                  <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                </div>
                <div>
                  <label>Departamento</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Ej. Brigada Norte" />
                </div>
                <div>
                  <label>Zona</label>
                  <input value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} placeholder="Ej. Norte" />
                </div>
                <div>
                  <label>Equipo</label>
                  <input value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} placeholder="Ej. Alpha" />
                </div>
                <div>
                  <label>Comunidad</label>
                  <input value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} placeholder="Ej. Comunidad San Juan" />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: 14 }}
                    onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? 'Cancelar cambio de contrasena' : 'Cambiar contrasena'}
                  </button>
                  {showPwd && (
                    <div className="grid grid-2" style={{ marginTop: 14 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>Contrasena actual *</label>
                        <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
                      </div>
                      <div>
                        <label>Nueva contrasena *</label>
                        <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} placeholder="Minimo 6 caracteres" />
                      </div>
                      <div>
                        <label>Confirmar contrasena *</label>
                        <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrigadistaProfile
