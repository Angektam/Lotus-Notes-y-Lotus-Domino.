import { useState, useEffect } from 'react'
import api from '../api/axios'

const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' }
const emptyForm = { title: '', content: '', category: '', priority: 'medium', isPublic: false }

function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [filters, setFilters] = useState({ priority: 'all', category: '', search: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [noteView, setNoteView] = useState('mine')
  const [publicNotes, setPublicNotes] = useState([])

  useEffect(() => { loadNotes() }, [])

  const loadNotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/notes')
      setNotes(response.data.notes || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar las notas.')
    } finally {
      setLoading(false)
    }
  }

  const loadPublicNotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/notes/public')
      setPublicNotes(response.data.notes || [])
    } catch (err) {
      if (err.response?.status !== 401) setError('No se pudieron cargar las notas públicas.')
    } finally {
      setLoading(false)
    }
  }

  const switchView = (view) => {
    setNoteView(view)
    if (view === 'public') loadPublicNotes()
    else loadNotes()
  }

  const openCreate = () => {
    setEditingNote(null)
    setFormData(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (note) => {
    setEditingNote(note)
    setFormData({ title: note.title, content: note.content, category: note.category || '', priority: note.priority, isPublic: note.isPublic || false })
    setFormError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.title.trim()) { setFormError('El título es obligatorio'); return }
    if (!formData.content.trim()) { setFormError('El contenido es obligatorio'); return }
    if (formData.title.length > 200) { setFormError('El título no puede exceder 200 caracteres'); return }
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, formData)
      } else {
        await api.post('/notes', formData)
      }
      setShowForm(false)
      loadNotes()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Error al guardar la nota')
    }
  }

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`)
      setNotes(prev => prev.filter(n => n.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la nota')
      setConfirmDelete(null)
    }
  }

  const categories = [...new Set(notes.map(n => n.category).filter(Boolean))]

  const filtered = notes.filter(n => {
    if (filters.priority !== 'all' && n.priority !== filters.priority) return false
    if (filters.category && n.category !== filters.category) return false
    if (filters.search) {
      const s = filters.search.toLowerCase()
      if (!n.title.toLowerCase().includes(s) && !n.content.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Notas</h1>
        {noteView === 'mine' && <button className="btn btn-success" onClick={openCreate}>+ Nueva Nota</button>}
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`btn ${noteView === 'mine' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchView('mine')}
        >
          📝 Mis Notas
        </button>
        <button
          className={`btn ${noteView === 'public' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchView('public')}
        >
          🌐 Notas Públicas
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {noteView === 'public' ? (
        loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#718096' }}>Cargando notas públicas...</p>
          </div>
        ) : publicNotes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '18px', color: '#718096' }}>No hay notas públicas disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {publicNotes.map((note) => (
              <div key={note.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3>{note.title}</h3>
                  <span className={`badge badge-${note.priority}`}>{PRIORITY_LABELS[note.priority] || note.priority}</span>
                </div>
                <p style={{ color: '#4a5568', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                {note.category && <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>📁 {note.category}</span>}
                <span style={{ fontSize: '12px', color: '#718096' }}>
                  👤 {note.author?.fullName || note.author?.username || 'Desconocido'}
                </span>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
      {/* Filtros */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: '13px', color: '#718096', display: 'block', marginBottom: '4px' }}>Buscar</label>
            <input type="text" placeholder="Buscar en título o contenido..." value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })} style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#718096', display: 'block', marginBottom: '4px' }}>Prioridad</label>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} style={{ width: 'auto' }}>
              <option value="all">Todas</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          {categories.length > 0 && (
            <div>
              <label style={{ fontSize: '13px', color: '#718096', display: 'block', marginBottom: '4px' }}>Categoría</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} style={{ width: 'auto' }}>
                <option value="">Todas</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <span style={{ fontSize: '13px', color: '#718096', marginTop: '18px' }}>
            {filtered.length} de {notes.length} notas
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#718096' }}>Cargando notas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            {filtered.map((note) => (
              <div key={note.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3>{note.title}</h3>
                  <span className={`badge badge-${note.priority}`}>{PRIORITY_LABELS[note.priority] || note.priority}</span>
                </div>
                <p style={{ color: '#4a5568', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                {note.category && <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '8px' }}>📁 {note.category}</span>}
                {note.isPublic && <span style={{ fontSize: '12px', color: '#28a745', display: 'block', marginBottom: '8px' }}>🌐 Pública</span>}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={() => openEdit(note)}>✏️ Editar</button>
                  {confirmDelete === note.id ? (
                    <>
                      <span style={{ fontSize: 13, color: '#ef4444' }}>¿Eliminar?</span>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => deleteNote(note.id)}>Sí</button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setConfirmDelete(null)}>No</button>
                    </>
                  ) : (
                    <button className="btn btn-danger" onClick={() => setConfirmDelete(note.id)}>🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '18px', color: '#718096' }}>No hay notas para mostrar.</p>
            </div>
          )}
        </>
      )}
      </>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div className="error-message" style={{ marginBottom: '12px' }}>{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="review-section">
                  <label>Título *</label>
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="review-section">
                  <label>Contenido *</label>
                  <textarea rows="5" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
                </div>
                <div className="grid grid-2">
                  <div className="review-section">
                    <label>Categoría</label>
                    <input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ej. Trabajo, Personal..." />
                  </div>
                  <div className="review-section">
                    <label>Prioridad</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="review-section">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} style={{ width: 'auto' }} />
                    Nota pública (visible para otros usuarios)
                  </label>
                </div>
                <div className="modal-footer" style={{ padding: '16px 0 0' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingNote ? 'Guardar cambios' : 'Crear Nota'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
