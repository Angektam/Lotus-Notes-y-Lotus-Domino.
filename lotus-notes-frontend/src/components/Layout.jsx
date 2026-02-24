import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ onLogout }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>Lotus Notes Colaboración</h2>
        </div>
        
        <div className="user-info">
          <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user.fullName || user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>

        <ul className="nav-menu">
          <li><Link to="/" className={isActive('/')}>Panel Principal</Link></li>
          <li><Link to="/notes" className={isActive('/notes')}>Notas</Link></li>
          <li><Link to="/tasks" className={isActive('/tasks')}>Tareas</Link></li>
          <li><Link to="/calendar" className={isActive('/calendar')}>Calendario</Link></li>
          <li><Link to="/messages" className={isActive('/messages')}>Mensajes</Link></li>
        </ul>

        <button className="btn btn-danger logout-btn" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
