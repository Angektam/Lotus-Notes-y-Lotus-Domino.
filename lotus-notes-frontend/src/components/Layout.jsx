import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import NotificationBell from './NotificationBell'
import './Layout.css'

function Layout({ onLogout, userRole }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { connectSocket, disconnectSocket, requestNotificationPermission } = useSocket()
  const isAdmin = userRole === 'admin'
  const isSupervisor = userRole === 'supervisor'
  const isBrigadista = userRole === 'brigadista'

  useEffect(() => {
    // Conectar socket al montar
    connectSocket()
    requestNotificationPermission()

    // Desconectar al desmontar
    return () => {
      disconnectSocket()
    }
  }, [])

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <div className={`layout${isBrigadista ? ' theme-brigadista' : isSupervisor ? ' theme-supervisor' : ''}`}>
      <nav className="sidebar">
        <div className="logo">
          <h2>📋 Servicio Social</h2>
          <p style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '5px 0 0 0'}}>
            {isAdmin ? 'Panel de Administración' : isSupervisor ? 'Panel del Supervisor' : isBrigadista ? 'Panel del Brigadista' : 'Gestión de Informes'}
          </p>
        </div>
        
        <div className="user-info">
          <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user.fullName || user.username}</div>
            <div className="user-role">
              {isAdmin ? '👑 Administrador' : isSupervisor ? '🧑‍💼 Supervisor' : isBrigadista ? '🧑‍🚒 Brigadista' : '👤 Estudiante'}
            </div>
          </div>
        </div>

        <ul className="nav-menu">
          {isAdmin ? (
            // Menú de Admin
            <>
              <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
              <li><Link to="/admin/reports" className={isActive('/admin/reports')}>📋 Revisar Informes</Link></li>
              <li><Link to="/admin/students" className={isActive('/admin/students')}>🎓 Estudiantes</Link></li>
              <li><Link to="/admin/users" className={isActive('/admin/users')}>👤 Usuarios</Link></li>
              <li><Link to="/reports" className={isActive('/reports')}>📝 Mis Informes</Link></li>
              <li><Link to="/notes" className={isActive('/notes')}>📄 Notas</Link></li>
              <li><Link to="/tasks" className={isActive('/tasks')}>✓ Tareas</Link></li>
              <li><Link to="/calendar" className={isActive('/calendar')}>📅 Calendario</Link></li>
              <li><Link to="/messages" className={isActive('/messages')}>💬 Mensajes</Link></li>
              <li><Link to="/gallery" className={isActive('/gallery')}>🖼️ Galería</Link></li>
            </>
          ) : isSupervisor ? (
            // Menú de Supervisor
            <>
              <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
              <li><Link to="/supervisor/brigadistas" className={isActive('/supervisor/brigadistas')}>👥 Brigadistas</Link></li>
              <li><Link to="/supervisor/assign" className={isActive('/supervisor/assign')}>📌 Asignar Reporte</Link></li>
              <li><Link to="/supervisor/pending" className={isActive('/supervisor/pending')}>🔎 Pendientes</Link></li>
              <li><Link to="/supervisor/search" className={isActive('/supervisor/search')}>🔍 Búsqueda</Link></li>
              <li><Link to="/analytics" className={isActive('/analytics')}>📈 Analíticas</Link></li>
              <li><Link to="/notes" className={isActive('/notes')}>📄 Notas</Link></li>
              <li><Link to="/tasks" className={isActive('/tasks')}>✓ Tareas</Link></li>
              <li><Link to="/calendar" className={isActive('/calendar')}>📅 Calendario</Link></li>
              <li><Link to="/messages" className={isActive('/messages')}>💬 Mensajes</Link></li>
              <li><Link to="/gallery" className={isActive('/gallery')}>🖼️ Galería</Link></li>
            </>
          ) : isBrigadista ? (
            // Menú de Brigadista
            <>
              <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
              <li><Link to="/brigadista/reports" className={isActive('/brigadista/reports')}>📋 Mis Reportes</Link></li>
              <li><Link to="/brigadista/profile" className={isActive('/brigadista/profile')}>👤 Mi Perfil</Link></li>
              <li><Link to="/analytics" className={isActive('/analytics')}>📈 Analíticas</Link></li>
              <li><Link to="/notes" className={isActive('/notes')}>📝 Notas</Link></li>
              <li><Link to="/tasks" className={isActive('/tasks')}>✓ Tareas</Link></li>
              <li><Link to="/calendar" className={isActive('/calendar')}>📅 Calendario</Link></li>
              <li><Link to="/messages" className={isActive('/messages')}>💬 Mensajes</Link></li>
              <li><Link to="/gallery" className={isActive('/gallery')}>🖼️ Galería</Link></li>
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
              <li><Link to="/gallery" className={isActive('/gallery')}>🖼️ Galería</Link></li>
            </>
          )}
        </ul>

        <button className="btn btn-danger logout-btn" onClick={onLogout}>
          🚪 Cerrar Sesión
        </button>
      </nav>

      <main className="main-content">
        <div className="top-bar">
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
