/**
 * Main application component
 * Integrates routing and global providers
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PrivateRoute from './router/PrivateRoute'
import AdminRoute from './router/AdminRoute'
import routes from './router/routes'
import './App.css'

/**
 * Route component wrapper with authentication check
 */
const RouteWithAuth: React.FC<{
  path: string
  element: React.ReactNode
  isPrivate?: boolean
  adminOnly?: boolean
}> = ({ path, element, isPrivate = false, adminOnly = false }) => {
  if (adminOnly) {
    return <AdminRoute path={path} element={element} />
  }

  if (isPrivate) {
    return <PrivateRoute path={path} element={element} />
  }

  return <Route path={path} element={element} />
}

/**
 * Main App component
 */
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

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
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<routes.Login />} />
        <Route path="/404" element={<routes.NotFound />} />

        {/* Protected routes */}
        {Object.entries(routes).map(([key, Component]) => {
          if (key === 'Login' || key === 'NotFound') return null

          const routeConfig = {
            Module1: { path: '/module1', isPrivate: true },
            Module2: { path: '/module2', isPrivate: true },
            Module3: { path: '/module3', isPrivate: true },
            Admin: { path: '/admin', isPrivate: true, adminOnly: true },
          }[key]

          if (!routeConfig) return null

          return (
            <RouteWithAuth
              key={routeConfig.path}
              path={routeConfig.path}
              element={<Component />}
              isPrivate={routeConfig.isPrivate}
              adminOnly={routeConfig.adminOnly}
            />
          )
        })}

        {/* Redirect root to login or module1 based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/module1" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  )
}

export default App
