import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminReports from './pages/AdminReports'
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

  // Componente para proteger rutas de admin
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />
    if (userRole !== 'admin' && userRole !== 'supervisor') {
      return <Navigate to="/" />
    }
    return children
  }

  return (
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
            userRole === 'admin' || userRole === 'supervisor' 
              ? <AdminDashboard /> 
              : <Dashboard />
          } />
          
          {/* Rutas de administrador */}
          <Route path="admin/reports" element={
            <AdminRoute><AdminReports /></AdminRoute>
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
  )
}

export default App
