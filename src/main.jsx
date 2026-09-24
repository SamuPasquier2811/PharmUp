import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import { StatusBar, Style } from '@capacitor/status-bar'
import App from './App.jsx'
import './index.css'

// Solo se ejecuta en app nativa; en web no hace nada
if (window.Capacitor) {
  StatusBar.setStyle({ style: Style.Light })
  StatusBar.setBackgroundColor({ color: '#ffffff' })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)