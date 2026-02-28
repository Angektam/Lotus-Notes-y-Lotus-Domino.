import { useState } from 'react'
import api from '../api/axios'
import './Login.css'

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [loginField, setLoginField] = useState('') // Campo único para username o email

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      
      let data
      if (isRegister) {
        data = formData
      } else {
        // Determinar si es email o username
        const isEmail = loginField.includes('@')
        data = {
          [isEmail ? 'email' : 'username']: loginField,
          password: formData.password
        }
      }
      
      const response = await api.post(endpoint, data)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      onLogin()
    } catch (err) {
      setError(err.response?.data?.error || 'Error de autenticación')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📋 Servicio Social</h1>
        <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="fullName"
                placeholder="Nombre Completo"
                value={formData.fullName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="department"
                placeholder="Departamento"
                value={formData.department}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          {!isRegister && (
            <input
              type="text"
              name="loginField"
              placeholder="Usuario o Correo Electrónico"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              required
            />
          )}
          
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <button type="submit" className="btn btn-primary btn-block">
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="toggle-text">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button onClick={() => setIsRegister(!isRegister)} className="link-btn">
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
