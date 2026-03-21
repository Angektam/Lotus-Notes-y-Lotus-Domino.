import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminReports from './pages/AdminReports'
import AdminStudents from './pages/AdminStudents'
import SupervisorDashboard from './pages/SupervisorDashboard'
import SupervisorBrigadistas from './pages/SupervisorBrigadistas'
import SupervisorAssignReport from './pages/SupervisorAssignReport'
import SupervisorPendingReports from './pages/SupervisorPendingReports'
import Analytics from './pages/Analytics'
import SupervisorSearch from './pages/SupervisorSearch'
import BrigadistaDashboard from './pages/BrigadistaDashboard'
import BrigadistaReports from './pages/BrigadistaReports'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Messages from './pages/Messages'
import Reports from './pages/Reports'
import Gallery from './pages/Gallery'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

// Lee el estado inicial directamente del localStorage para evitar el flash
// de redirección que ocurre cuando useState arranca en false y el useEffect
// lo corrige un frame después.
function getInitialAuth() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return { isAuthenticated: !!token, userRole: user.role || null }
}

function App() {
  const initial = getInitialAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated)
  const [userRole, setUserRole] = useState(initial.userRole)

  // Sincroniza si otra pestaña modifica el localStorage
  useEffect(() => {
    const onStorage = () => {
      const { isAuthenticated: auth, userRole: role } = getInitialAuth()
      setIsAuthenticated(auth)
      setUserRole(role)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setIsAuthenticated(true)
    setUserRole(user.role)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUserRole(null)
  }

  const RoleRoute = ({ allow, children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (!allow.includes(userRole)) return <Navigate to="/" replace />
    return children
  }

  return (
    <ErrorBoundary>
      <SocketProvider>
        <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          } />

          <Route path="/" element={
            isAuthenticated
              ? <Layout onLogout={handleLogout} userRole={userRole} />
              : <Navigate to="/login" replace />
          }>
            <Route index element={
              userRole === 'admin'
                ? <AdminDashboard />
                : userRole === 'supervisor'
                  ? <SupervisorDashboard />
                  : userRole === 'brigadista'
                    ? <BrigadistaDashboard />
                    : <Dashboard />
            } />

            {/* Admin */}
            <Route path="admin/reports" element={
              <RoleRoute allow={['admin']}><AdminReports /></RoleRoute>
            } />
            <Route path="admin/students" element={
              <RoleRoute allow={['admin', 'supervisor']}><AdminStudents /></RoleRoute>
            } />

            {/* Supervisor */}
            <Route path="supervisor/brigadistas" element={
              <RoleRoute allow={['supervisor', 'admin']}><SupervisorBrigadistas /></RoleRoute>
            } />
            <Route path="supervisor/assign" element={
              <RoleRoute allow={['supervisor', 'admin']}><SupervisorAssignReport /></RoleRoute>
            } />
            <Route path="supervisor/pending" element={
              <RoleRoute allow={['supervisor', 'admin']}><SupervisorPendingReports /></RoleRoute>
            } />
            <Route path="supervisor/search" element={
              <RoleRoute allow={['supervisor', 'admin']}><SupervisorSearch /></RoleRoute>
            } />

            {/* Brigadista */}
            <Route path="brigadista/reports" element={
              <RoleRoute allow={['brigadista', 'admin']}><Reports /></RoleRoute>
            } />

            {/* Estudiante / general — redirige según rol */}
            <Route path="reports" element={
              userRole === 'brigadista'
                ? <Navigate to="/brigadista/reports" replace />
                : <Reports />
            } />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notes" element={<Notes />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="messages" element={<Messages />} />
            <Route path="gallery" element={<Gallery />} />

            {/* 404 dentro del layout */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* 404 fuera del layout */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SocketProvider>
    </ErrorBoundary>
  )
}

export default App
