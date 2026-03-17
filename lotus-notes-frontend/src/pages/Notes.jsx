import { useState, useEffect } from 'react'
import api from '../api/axios'

function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium',
    isPublic: false
  })

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/notes')
      setNotes(response.data.notes || [])
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('No se pudieron cargar las notas. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('El título es obligatorio')
      return
    }
    if (!formData.content.trim()) {
      setFormError('El contenido es obligatorio')
      return
    }
    if (formData.title.length > 200) {
      setFormError('El título no puede exceder 200 caracteres')
      return
    }

    try {
      await api.post('/notes', formData)
      setFormData({ title: '', content: '', category: '', priority: 'medium', isPublic: false })
      setShowForm(false)
      loadNotes()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Error al crear la nota')
    }
  }

  const deleteNote = async (id) => {
    if (!window.confirm('¿Eliminar esta nota?')) return
    try {
      await api.delete(`/notes/${id}`)
      loadNotes()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la nota')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mis Notas</h1>
        <button className="btn btn-success" onClick={() => { setShowForm(!showForm); setFormError('') }}>
          {showForm ? 'Cancelar' : '+ Nueva Nota'}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3>Crear Nueva Nota</h3>
          {formError && <div className="error-message" style={{ marginBottom: '12px' }}>{formError}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Contenido *"
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Categoría"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                style={{ width: 'auto' }}
              />
              Nota pública
            </label>
            <button type="submit" className="btn btn-primary">Guardar Nota</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#718096' }}>Cargando notas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            {notes.map((note) => (
              <div key={note.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h3>{note.title}</h3>
                  <span className={`badge badge-${note.priority}`}>{note.priority}</span>
                </div>
                <p style={{ color: '#4a5568', marginBottom: '12px' }}>{note.content}</p>
                {note.category && (
                  <span style={{ fontSize: '12px', color: '#718096' }}>{note.category}</span>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-danger" onClick={() => deleteNote(note.id)}>
                    Eliminar
                  </button>
                  {note.isPublic && <span style={{ fontSize: '12px', color: '#28a745' }}>🌐 Pública</span>}
                </div>
              </div>
            ))}
          </div>

          {notes.length === 0 && !showForm && (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '18px', color: '#718096' }}>No tienes notas aún. ¡Crea tu primera nota!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Notes
