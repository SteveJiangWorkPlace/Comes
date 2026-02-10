/**
 * Main application component
 * Integrates routing and global providers
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuthLoading } from './store/auth.store'
import AppRoutes from './router/routes'
import './App.css'

/**
 * Main App component
 */
const App: React.FC = () => {
  const isLoading = useAuthLoading()

  // Initialize app on mount
  useEffect(() => {
    console.log('Comes应用启动')

    // Check for saved auth state
    const token = localStorage.getItem('auth_token')
    if (token) {
      console.log('检测到保存的认证令牌')
    }

    // Initialize any app-wide setup here
    return () => {
      console.log('Comes应用清理')
    }
  }, [])

  // Show loading state while checking auth
  if (isLoading && window.location.pathname !== '/login') {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
