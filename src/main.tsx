import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Capacitor } from '@capacitor/core'

if (Capacitor.isNativePlatform()) {
  document.body.classList.add('is-native-app')
} else {
  document.body.classList.remove('is-native-app')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
