import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [view, setView] = useState('inbox')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ receiverId: '', subject: '', body: '', priority: 'normal' })
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Búsqueda de destinatario
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => { loadMessages() }, [view])

  const loadMessages = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = view === 'inbox' ? '/messages/inbox' : '/messages/sent'
      const response = await api.get(endpoint)
      setMessages(response.data.messages || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar los mensajes.')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSearch = (value) => {
    setUserSearch(value)
    setSelectedUser(null)
    setFormData(prev => ({ ...prev, receiverId: '' }))
    clearTimeout(searchTimeout.current)
    if (value.trim().length < 2) { setUserResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await api.get(`/auth/users/search?q=${encodeURIComponent(value)}`)
        setUserResults(res.data.users || [])
      } catch { setUserResults([]) }
      finally { setSearchLoading(false) }
    }, 300)
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    setUserSearch(user.fullName || user.username)
    setFormData(prev => ({ ...prev, receiverId: user.id }))
    setUserResults([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.receiverId) { setFormError('Selecciona un destinatario'); return }
    if (!formData.subject.trim()) { setFormError('El asunto es obligatorio'); return }
    if (!formData.body.trim()) { setFormError('El mensaje no puede estar vacío'); return }
    setSubmitting(true)
    try {
      await api.post('/messages', formData)
      setFormData({ receiverId: '', subject: '', body: '', priority: 'normal' })
      setUserSearch('')
      setSelectedUser(null)
      setShowForm(false)
      setSuccessMsg('Mensaje enviado')
      setTimeout(() => setSuccessMsg(''), 4000)
      if (view === 'sent') loadMessages()
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch (err) {
      setError(err.response?.data?.message || 'Error al marcar como leído')
    }
  }

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`)
      setMessages(prev => prev.filter(m => m.id !== id))
      setConfirmDelete(null)
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el mensaje')
      setConfirmDelete(null)
    }
  }

  const toggleExpand = (msg) => {
    const newId = expandedId === msg.id ? null : msg.id
    setExpandedId(newId)
    // Marcar como leído automáticamente al abrir
    if (newId && !msg.isRead && view === 'inbox') markAsRead(msg.id)
  }

  const replyTo = (msg) => {
    setShowForm(true)
    setSelectedUser({ id: msg.sender?.id, fullName: msg.sender?.fullName, username: msg.sender?.username, email: msg.sender?.email })
    setUserSearch(msg.sender?.fullName || msg.sender?.username || '')
    setFormData({ receiverId: msg.sender?.id, subject: `Re: ${msg.subject}`, body: '', priority: 'normal' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const priorityBadge = (p) => ({ low: '🟢 Baja', normal: '🔵 Normal', high: '🔴 Alta' }[p] || p)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>💬 Mensajes</h1>
        <button className="btn btn-success" onClick={() => { setShowForm(!showForm); setFormError('') }}>
          {showForm ? 'Cancelar' : '+ Nuevo Mensaje'}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
      {successMsg && <div className="success-message" style={{ marginBottom: 16 }}>{successMsg}</div>}

      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button className={`btn ${view === 'inbox' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('inbox')}>
          📥 Recibidos
          {view !== 'inbox' && messages.filter(m => !m.isRead).length > 0 && (
            <span style={{ marginLeft: 6, background: '#ef4444', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 12 }}>
              {messages.filter(m => !m.isRead).length}
            </span>
          )}
        </button>
        <button className={`btn ${view === 'sent' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('sent')}>📤 Enviados</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Nuevo Mensaje</h3>
          {formError && <div className="error-message" style={{ marginBottom: 12 }}>{formError}</div>}
          <form onSubmit={handleSubmit}>
            {/* Búsqueda de destinatario */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Destinatario *</label>
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o email..."
                value={userSearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              {searchLoading && <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Buscando...</div>}
              {userResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                  border: '1px solid #e2e8f0', borderRadius: 6, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {userResults.map(u => (
                    <div key={u.id} onClick={() => selectUser(u)} style={{
                      padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f7fafc',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <span>{u.fullName || u.username}</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>{u.role} · {u.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedUser && (
                <div style={{ marginTop: 6, fontSize: 13, color: '#38a169' }}>
                  ✓ {selectedUser.fullName || selectedUser.username} ({selectedUser.email})
                </div>
              )}
            </div>

            <input type="text" placeholder="Asunto *" value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })} maxLength={200} required />
            <div style={{ position: 'relative' }}>
              <textarea placeholder="Mensaje *" rows="5" value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                maxLength={2000} required />
              <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: formData.body.length > 1800 ? '#e53e3e' : '#9ca3af' }}>
                {formData.body.length}/2000
              </span>
            </div>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <option value="low">Baja prioridad</option>
              <option value="normal">Normal</option>
              <option value="high">Alta prioridad</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : '📤 Enviar'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#718096' }}>Cargando mensajes...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 18, color: '#718096' }}>
            {view === 'inbox' ? 'No tienes mensajes recibidos.' : 'No has enviado mensajes.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} className="card" style={{
              background: msg.isRead ? 'white' : '#edf2f7',
              borderLeft: msg.isRead ? '' : '4px solid #4299e1',
              marginBottom: 0,
              cursor: 'pointer'
            }}>
              {/* Cabecera — siempre visible */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => toggleExpand(msg)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  {!msg.isRead && view === 'inbox' && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4299e1', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: msg.isRead ? 400 : 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontSize: 13, color: '#718096' }}>
                      {view === 'inbox' ? (msg.sender?.fullName || msg.sender?.username) : (msg.receiver?.fullName || msg.receiver?.username)}
                      {' · '}{new Date(msg.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: '#9ca3af', marginLeft: 8 }}>{expandedId === msg.id ? '▲' : '▼'}</span>
              </div>

              {/* Cuerpo — visible al expandir */}
              {expandedId === msg.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 16 }}>{msg.body}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {view === 'inbox' && (
                      <button className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px' }}
                        onClick={(e) => { e.stopPropagation(); replyTo(msg) }}>
                        ↩ Responder
                      </button>
                    )}
                    {confirmDelete === msg.id ? (
                      <>
                        <span style={{ fontSize: 13, color: '#ef4444', alignSelf: 'center' }}>¿Eliminar?</span>
                        <button className="btn btn-danger" style={{ fontSize: 13, padding: '6px 12px' }}
                          onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id) }}>Sí</button>
                        <button className="btn btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null) }}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-danger" style={{ fontSize: 13, padding: '6px 14px' }}
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(msg.id) }}>
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Messages
