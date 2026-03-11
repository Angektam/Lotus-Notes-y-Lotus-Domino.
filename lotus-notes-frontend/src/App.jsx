import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminReports from './pages/AdminReports'
import AdminStudents from './pages/AdminStudents'
import SupervisorDashboard from './pages/SupervisorDashboard'
import SupervisorBrigadistas from './pages/SupervisorBrigadistas'
import SupervisorAssignReport from './pages/SupervisorAssignReport'
import SupervisorPendingReports from './pages/SupervisorPendingReports'
import BrigadistaDashboard from './pages/BrigadistaDashboard'
import BrigadistaReports from './pages/BrigadistaReports'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Messages from './pages/Messages'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setIsAuthenticated(!!token)
    setUserRole(user.role)
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
    if (!isAuthenticated) return <Navigate to="/login" />
    if (!allow.includes(userRole)) return <Navigate to="/" />
    return children
  }

  return (
    <SocketProvider>
      <Router>
        <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Layout onLogout={handleLogout} userRole={userRole} /> : <Navigate to="/login" />
        }>
          {/* Rutas según el rol */}
          <Route index element={
            userRole === 'admin'
              ? <AdminDashboard />
              : userRole === 'supervisor'
                ? <SupervisorDashboard />
                : userRole === 'brigadista'
                  ? <BrigadistaDashboard />
                  : <Dashboard />
          } />
          
          {/* Rutas de administrador */}
          <Route path="admin/reports" element={
            <RoleRoute allow={['admin']}><AdminReports /></RoleRoute>
          } />
          <Route path="admin/students" element={
            <RoleRoute allow={['admin', 'supervisor']}><AdminStudents /></RoleRoute>
          } />

          {/* Rutas de supervisor */}
          <Route path="supervisor/brigadistas" element={
            <RoleRoute allow={['supervisor', 'admin']}><SupervisorBrigadistas /></RoleRoute>
          } />
          <Route path="supervisor/assign" element={
            <RoleRoute allow={['supervisor', 'admin']}><SupervisorAssignReport /></RoleRoute>
          } />
          <Route path="supervisor/pending" element={
            <RoleRoute allow={['supervisor', 'admin']}><SupervisorPendingReports /></RoleRoute>
          } />
          
          {/* Rutas de brigadista */}
          <Route path="brigadista/reports" element={
            <RoleRoute allow={['brigadista', 'admin']}><BrigadistaReports /></RoleRoute>
          } />
          
          {/* Rutas de estudiante */}
          <Route path="reports" element={<Reports />} />
          <Route path="notes" element={<Notes />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        </Routes>
      </Router>
    </SocketProvider>
  )
}

export default App
