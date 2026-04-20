import { Link, useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 80, marginBottom: 8 }}>🔍</div>
      <h1 style={{ fontSize: '72px', color: '#dadce0', marginBottom: '8px' }}>404</h1>
      <h2 style={{ color: '#5f6368', marginBottom: '16px' }}>Página no encontrada</h2>
      <p style={{ color: '#80868b', marginBottom: '32px', maxWidth: 400, margin: '0 auto 32px' }}>
        La ruta que buscas no existe o fue movida.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Volver atrás
        </button>
        <Link to="/" className="btn btn-primary">Ir al inicio</Link>
      </div>
    </div>
  )
}

export default NotFound
