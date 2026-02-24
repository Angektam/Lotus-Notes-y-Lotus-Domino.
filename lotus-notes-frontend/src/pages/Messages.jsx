import { useState, useEffect } from 'react'
import api from '../api/axios'

function Messages() {
  const [messages, setMessages] = useState([])
  const [view, setView] = useState('inbox')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    receiverId: '',
    subject: '',
    body: '',
    priority: 'normal'
  })

  useEffect(() => {
    loadMessages()
  }, [view])

  const loadMessages = async () => {
    try {
      const endpoint = view === 'inbox' ? '/messages/inbox' : '/messages/sent'
      const response = await api.get(endpoint)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/messages', formData)
      setFormData({ receiverId: '', subject: '', body: '', priority: 'normal' })
      setShowForm(false)
      if (view === 'sent') loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`)
      loadMessages()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mensajes</h1>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Mensaje'}
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${view === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('inbox')}
        >
          Recibidos
        </button>
        <button
          className={`btn ${view === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('sent')}
        >
          Enviados
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Nuevo Mensaje</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              placeholder="ID del destinatario"
              value={formData.receiverId}
              onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Asunto"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <textarea
              placeholder="Mensaje"
              rows="5"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
            </select>
            <button type="submit" className="btn btn-primary">Enviar Mensaje</button>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {messages.map((msg) => (
          <div key={msg.id} className="card" style={{ background: msg.isRead ? 'white' : '#edf2f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3>{msg.subject}</h3>
              {!msg.isRead && view === 'inbox' && (
                <span style={{ background: '#48bb78', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  Nuevo
                </span>
              )}
            </div>
            <p style={{ color: '#4a5568', marginBottom: '12px' }}>{msg.body}</p>
            <div style={{ fontSize: '14px', color: '#718096' }}>
              <p>
                {view === 'inbox' ? 'De: ' : 'Para: '}
                {view === 'inbox' ? msg.sender?.fullName || msg.sender?.username : msg.receiver?.fullName || msg.receiver?.username}
              </p>
              <p>{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
            {!msg.isRead && view === 'inbox' && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => markAsRead(msg.id)}
              >
                Marcar como leído
              </button>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '18px', color: '#718096' }}>
            {view === 'inbox' ? 'No tienes mensajes recibidos.' : 'No has enviado mensajes.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Messages
