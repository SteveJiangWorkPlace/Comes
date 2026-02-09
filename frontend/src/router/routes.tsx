import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'

// Lazy load pages for code splitting
const Login = lazy(() => import('../pages/Login/Login'))
const Module1 = lazy(() => import('../pages/Module1/Module1'))
const Module2 = lazy(() => import('../pages/Module2/Module2'))
const Module3 = lazy(() => import('../pages/Module3/Module3'))
const Admin = lazy(() => import('../pages/Admin/Admin'))
const NotFound = lazy(() => import('../pages/NotFound/NotFound'))

// Layout component (will be implemented in component library)
const AppLayout = lazy(() => import('../components/layout/AppLayout/AppLayout'))

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

/**
 * Application routes configuration
 */
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with AppLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            {/* Default redirect to module1 */}
            <Route path="/" element={<Navigate to="/module1" replace />} />

            {/* Module routes */}
            <Route path="/module1" element={<Module1 />} />
            <Route path="/module2" element={<Module2 />} />
            <Route path="/module3" element={<Module3 />} />

            {/* Admin routes (nested admin protection) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
