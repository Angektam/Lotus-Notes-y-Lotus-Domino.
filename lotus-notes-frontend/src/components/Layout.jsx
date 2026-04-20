import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import NotificationBell from './NotificationBell'
import './Layout.css'

// Iconos SVG inline — consistentes en todos los navegadores
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

const ICONS = {
  dashboard:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  reports:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  profile:     ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  analytics:   ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  notes:       ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
  tasks:       ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'],
  calendar:    ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z'],
  messages:    ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  gallery:     ['M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z', 'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M21 15l-5-5L5 21'],
  brigadistas: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  assign:      ['M12 5v14', 'M5 12h14'],
  pending:     ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  search:      ['M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M21 21l-4.35-4.35'],
  students:    ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
  users:       ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  logout:      ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
}

const NavItem = ({ to, icon, label, active }) => (
  <li>
    <Link to={to} className={active}>
      <Icon d={ICONS[icon]} />
      <span>{label}</span>
    </Link>
  </li>
)

function Layout({ onLogout, userRole }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { connectSocket, disconnectSocket, requestNotificationPermission } = useSocket()
  const isAdmin = userRole === 'admin'
  const isSupervisor = userRole === 'supervisor'
  const isBrigadista = userRole === 'brigadista'

  useEffect(() => {
    connectSocket()
    requestNotificationPermission()
    return () => disconnectSocket()
  }, [])

  const a = (path) => location.pathname === path ? 'active' : ''

  const roleLabel = isAdmin ? 'Administrador' : isSupervisor ? 'Supervisor' : isBrigadista ? 'Brigadista' : 'Estudiante'
  const panelLabel = isAdmin ? 'Panel de Administración' : isSupervisor ? 'Panel del Supervisor' : isBrigadista ? 'Panel del Brigadista' : 'Gestión de Informes'

  return (
    <div className={`layout${isBrigadista ? ' theme-brigadista' : isSupervisor ? ' theme-supervisor' : ''}`}>
      <nav className="sidebar">
        <div className="logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={ICONS.reports} size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>Servicio Social</h2>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{panelLabel}</p>
            </div>
          </div>
        </div>

        <div className="user-info">
          <div className="avatar">{(user.fullName || user.username || 'U')[0].toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.fullName || user.username}
            </div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>

        <ul className="nav-menu">
          {isAdmin ? (<>
            <NavItem to="/"               icon="dashboard"   label="Dashboard"        active={a('/')} />
            <NavItem to="/admin/reports"  icon="reports"     label="Revisar Informes" active={a('/admin/reports')} />
            <NavItem to="/admin/students" icon="students"    label="Estudiantes"      active={a('/admin/students')} />
            <NavItem to="/admin/users"    icon="users"       label="Usuarios"         active={a('/admin/users')} />
            <NavItem to="/admin/access-log" icon="pending"   label="Auditoría"        active={a('/admin/access-log')} />
            <NavItem to="/reports"        icon="reports"     label="Mis Informes"     active={a('/reports')} />
            <NavItem to="/notes"          icon="notes"       label="Notas"            active={a('/notes')} />
            <NavItem to="/tasks"          icon="tasks"       label="Tareas"           active={a('/tasks')} />
            <NavItem to="/calendar"       icon="calendar"    label="Calendario"       active={a('/calendar')} />
            <NavItem to="/messages"       icon="messages"    label="Mensajes"         active={a('/messages')} />
            <NavItem to="/gallery"        icon="gallery"     label="Galería"          active={a('/gallery')} />
          </>) : isSupervisor ? (<>
            <NavItem to="/"                        icon="dashboard"   label="Dashboard"       active={a('/')} />
            <NavItem to="/supervisor/brigadistas"  icon="brigadistas" label="Brigadistas"     active={a('/supervisor/brigadistas')} />
            <NavItem to="/supervisor/assign"       icon="assign"      label="Asignar Reporte" active={a('/supervisor/assign')} />
            <NavItem to="/supervisor/pending"      icon="pending"     label="Pendientes"      active={a('/supervisor/pending')} />
            <NavItem to="/supervisor/search"       icon="search"      label="Búsqueda"        active={a('/supervisor/search')} />
            <NavItem to="/analytics"               icon="analytics"   label="Analíticas"      active={a('/analytics')} />
            <NavItem to="/notes"                   icon="notes"       label="Notas"           active={a('/notes')} />
            <NavItem to="/tasks"                   icon="tasks"       label="Tareas"          active={a('/tasks')} />
            <NavItem to="/calendar"                icon="calendar"    label="Calendario"      active={a('/calendar')} />
            <NavItem to="/messages"                icon="messages"    label="Mensajes"        active={a('/messages')} />
            <NavItem to="/gallery"                 icon="gallery"     label="Galería"         active={a('/gallery')} />
          </>) : isBrigadista ? (<>
            <NavItem to="/"                    icon="dashboard"  label="Dashboard"   active={a('/')} />
            <NavItem to="/brigadista/reports"  icon="reports"    label="Mis Reportes" active={a('/brigadista/reports')} />
            <NavItem to="/brigadista/profile"  icon="profile"    label="Mi Perfil"   active={a('/brigadista/profile')} />
            <NavItem to="/analytics"           icon="analytics"  label="Analíticas"  active={a('/analytics')} />
            <NavItem to="/notes"               icon="notes"      label="Notas"       active={a('/notes')} />
            <NavItem to="/tasks"               icon="tasks"      label="Tareas"      active={a('/tasks')} />
            <NavItem to="/calendar"            icon="calendar"   label="Calendario"  active={a('/calendar')} />
            <NavItem to="/messages"            icon="messages"   label="Mensajes"    active={a('/messages')} />
            <NavItem to="/gallery"             icon="gallery"    label="Galería"     active={a('/gallery')} />
          </>) : (<>
            <NavItem to="/"        icon="dashboard" label="Dashboard"    active={a('/')} />
            <NavItem to="/reports" icon="reports"   label="Mis Informes" active={a('/reports')} />
            <NavItem to="/notes"   icon="notes"     label="Notas"        active={a('/notes')} />
            <NavItem to="/tasks"   icon="tasks"     label="Tareas"       active={a('/tasks')} />
            <NavItem to="/calendar" icon="calendar" label="Calendario"   active={a('/calendar')} />
            <NavItem to="/messages" icon="messages" label="Mensajes"     active={a('/messages')} />
            <NavItem to="/gallery"  icon="gallery"  label="Galería"      active={a('/gallery')} />
          </>)}
        </ul>

        <button className="btn btn-danger logout-btn" onClick={onLogout}>
          <Icon d={ICONS.logout} size={16} />
          Cerrar Sesión
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
