import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

/**
 * Admin route component that redirects to home if user is not an admin
 */
const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    // User is not an admin, redirect to home page
    return <Navigate to="/" replace />
  }

  // User is authenticated and is an admin, render the child routes
  return <Outlet />
}

export default AdminRoute
