import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ onLogout, userRole }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = userRole === 'admin' || userRole === 'supervisor'

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>📋 Servicio Social</h2>
          <p style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '5px 0 0 0'}}>
            {isAdmin ? 'Panel de Administración' : 'Gestión de Informes'}
          </p>
        </div>
        
        <div className="user-info">
          <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user.fullName || user.username}</div>
            <div className="user-role">
              {isAdmin ? '👑 Administrador' : '👤 Estudiante'}
            </div>
          </div>
        </div>

        <ul className="nav-menu">
          {isAdmin ? (
            // Menú de Administrador
            <>
              <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
              <li><Link to="/admin/reports" className={isActive('/admin/reports')}>📋 Revisar Informes</Link></li>
              <li><Link to="/reports" className={isActive('/reports')}>📝 Mis Informes</Link></li>
              <li><Link to="/notes" className={isActive('/notes')}>📄 Notas</Link></li>
              <li><Link to="/tasks" className={isActive('/tasks')}>✓ Tareas</Link></li>
              <li><Link to="/calendar" className={isActive('/calendar')}>📅 Calendario</Link></li>
              <li><Link to="/messages" className={isActive('/messages')}>💬 Mensajes</Link></li>
            </>
          ) : (
            // Menú de Estudiante
            <>
              <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
              <li><Link to="/reports" className={isActive('/reports')}>📋 Mis Informes</Link></li>
              <li><Link to="/notes" className={isActive('/notes')}>📝 Notas</Link></li>
              <li><Link to="/tasks" className={isActive('/tasks')}>✓ Tareas</Link></li>
              <li><Link to="/calendar" className={isActive('/calendar')}>📅 Calendario</Link></li>
              <li><Link to="/messages" className={isActive('/messages')}>💬 Mensajes</Link></li>
            </>
          )}
        </ul>

        <button className="btn btn-danger logout-btn" onClick={onLogout}>
          🚪 Cerrar Sesión
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
