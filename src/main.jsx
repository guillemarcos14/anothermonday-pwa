import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#FEE', minHeight: '100dvh' }}>
          <h1 style={{ color: '#C00', fontSize: 20 }}>Error en la aplicación</h1>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16, fontSize: 13, color: '#333' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 11, color: '#666' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Dismiss splash screen — wait a tick so React has time to paint
setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.classList.add('hide')
    setTimeout(() => splash.remove(), 500)
  }
}, 300)

// Listen for service worker background sync messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'ORDER_SYNCED' && event.data.success) {
      // Dynamically import to avoid circular deps
      import('./store/toastStore').then(({ useToastStore }) => {
        useToastStore.getState().addToast('Pedido sincronizado correctamente', 'success')
      })
      import('./hooks/useOrders').then(({ notifyOrdersChanged }) => {
        notifyOrdersChanged()
      })
      import('./hooks/usePoints').then(({ notifyPointsChanged }) => {
        notifyPointsChanged()
      })
    }
  })

  // iOS fallback: replay pending orders on online event
  // (Background Sync API is not supported on iOS Safari)
  window.addEventListener('online', () => {
    import('./hooks/useOrders').then(({ notifyOrdersChanged }) => {
      notifyOrdersChanged()
    })
    import('./hooks/usePoints').then(({ notifyPointsChanged }) => {
      notifyPointsChanged()
    })
  })
}
