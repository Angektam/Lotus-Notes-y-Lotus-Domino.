import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '1rem', padding: '2rem'
        }}>
          <h2>Algo salió mal</h2>
          <p style={{ color: '#666', textAlign: 'center' }}>
            {this.state.error?.message || 'Error inesperado en la aplicación'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}
          >
            Volver al inicio
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
