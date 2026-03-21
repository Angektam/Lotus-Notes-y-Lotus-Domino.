import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import './Gallery.css'

function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)   // imagen ampliada
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/gallery')
      setImages(data.data || [])
    } catch {
      setError('No se pudieron cargar las imágenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const form = new FormData()
    form.append('image', file)

    setUploading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/gallery', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Imagen subida correctamente')
      fetchImages()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const handleDelete = async (filename) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await api.delete(`/gallery/${filename}`)
      setImages(prev => prev.filter(img => img.filename !== filename))
    } catch {
      setError('No se pudo eliminar la imagen')
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div>
          <h1>🖼️ Galería de Imágenes</h1>
          <p>{images.length} imagen{images.length !== 1 ? 'es' : ''}</p>
        </div>
        <label className={`btn btn-primary upload-btn ${uploading ? 'disabled' : ''}`}>
          {uploading ? '⏳ Subiendo...' : '📤 Subir imagen'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="gallery-loading">Cargando imágenes...</div>
      ) : images.length === 0 ? (
        <div className="gallery-empty">
          <span>📷</span>
          <p>No hay imágenes aún. Sube la primera.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map(img => (
            <div key={img.filename} className="gallery-card">
              <div className="gallery-img-wrap" onClick={() => setPreview(img)}>
                <img src={`${BASE}${img.url}`} alt={img.filename} loading="lazy" />
                <div className="gallery-overlay">🔍 Ver</div>
              </div>
              <div className="gallery-card-info">
                <span className="gallery-name" title={img.originalName || img.filename}>
                  {img.originalName || img.filename}
                </span>
                <span className="gallery-size">{formatSize(img.size)}</span>
                <button
                  className="btn-icon delete"
                  onClick={() => handleDelete(img.filename)}
                  title="Eliminar"
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div className="lightbox" onClick={() => setPreview(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setPreview(null)}>✕</button>
            <img src={`${BASE}${preview.url}`} alt={preview.originalName || preview.filename} />
            <p>{preview.originalName || preview.filename} · {formatSize(preview.size)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
