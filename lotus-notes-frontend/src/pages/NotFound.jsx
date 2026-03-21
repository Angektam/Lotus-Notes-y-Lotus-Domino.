import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '72px', color: '#dadce0', marginBottom: '8px' }}>404</h1>
      <h2 style={{ color: '#5f6368', marginBottom: '16px' }}>Página no encontrada</h2>
      <p style={{ color: '#80868b', marginBottom: '32px' }}>
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}

export default NotFound
