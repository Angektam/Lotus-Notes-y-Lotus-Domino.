import { useState, useEffect } from 'react'
import api from '../api/axios'

function Notes() {
  const [notes, setNotes] = useState([])
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
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token de autenticación');
      return;
    }

    try {
      const response = await api.get('/notes');
      setNotes(response.data.notes || []);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Sesión expirada');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.error('Error loading notes:', error);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!formData.content.trim()) {
      alert('El contenido es obligatorio');
      return;
    }

    if (formData.title.length > 200) {
      alert('El título no puede exceder 200 caracteres');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
      window.location.href = '/login';
      return;
    }

    try {
      await api.post('/notes', formData);
      setFormData({ title: '', content: '', category: '', priority: 'medium', isPublic: false });
      setShowForm(false);
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(error.response?.data?.message || 'Error al crear la nota');
      }
    }
  }

  const deleteNote = async (id) => {
    if (confirm('¿Eliminar esta nota?')) {
      try {
        await api.delete(`/notes/${id}`)
        loadNotes()
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333' }}>Mis Notas</h1>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Nota'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Crear Nueva Nota</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Contenido"
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
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-danger" onClick={() => deleteNote(note.id)}>
                Eliminar
              </button>
              {note.isPublic && <span style={{ fontSize: '12px', color: '#28a745' }}>Pública</span>}
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '18px', color: '#718096' }}>No tienes notas aún. ¡Crea tu primera nota!</p>
        </div>
      )}
    </div>
  )
}

export default Notes
