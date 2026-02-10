/**
 * Authentication hook
 * Provides convenient authentication functionality using the auth store
 */

import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  useAuthStore,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useAuthError,
} from '../store/auth.store'
import { LoginFormData } from '../types/auth.types'

/**
 * Main authentication hook
 */
export const useAuth = () => {
  // Note: useNavigate and useLocation are removed from here
  // They will be called inside the functions that actually need them
  // or passed as parameters by the caller

  // Get auth store state and actions
  const isAuthenticated = useIsAuthenticated()
  const user = useCurrentUser()
  const isLoading = useAuthLoading()
  const error = useAuthError()
  const {
    login: storeLogin,
    logout: storeLogout,
    register: storeRegister,
    refreshUser: storeRefreshUser,
    updateUser: storeUpdateUser,
    clearError: storeClearError,
    reset: storeReset,
  } = useAuthStore()

  /**
   * Login function (without redirect handling)
   * Caller should handle navigation after successful login
   */
  const login = useCallback(
    async (credentials: LoginFormData) => {
      try {
        await storeLogin(credentials)
        // Navigation is now the responsibility of the caller
        return true
      } catch (err) {
        // Error is already set in the store
        console.error('Login failed:', err)
        return false
      }
    },
    [storeLogin]
  )

  /**
   * Logout function (without redirect handling)
   * Caller should handle navigation after logout
   */
  const logout = useCallback(async () => {
    await storeLogout()
    // Navigation is now the responsibility of the caller
  }, [storeLogout])

  /**
   * Register function (without auto-login redirect)
   * Caller should handle navigation after successful registration
   */
  const register = useCallback(
    async (data: { username: string; email: string; password: string }) => {
      try {
        await storeRegister(data)
        // Navigation is now the responsibility of the caller
        return true
      } catch (err) {
        console.error('Registration failed:', err)
        return false
      }
    },
    [storeRegister]
  )

  /**
   * Check if user has admin role
   */
  const isAdmin = useCallback(() => {
    return user?.role === 'admin'
  }, [user])

  /**
   * Check if user has required role
   */
  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!user) return false
      if (Array.isArray(role)) {
        return role.includes(user.role)
      }
      return user.role === role
    },
    [user]
  )

  /**
   * Get user's remaining credits
   */
  const getRemainingCredits = useCallback(() => {
    return user?.remainingCredits || 0
  }, [user])

  /**
   * Check if user has sufficient credits
   */
  const hasSufficientCredits = useCallback(
    (requiredCredits: number) => {
      const credits = getRemainingCredits()
      return credits >= requiredCredits
    },
    [getRemainingCredits]
  )

  /**
   * Format subscription expiry date
   */
  const formatSubscriptionExpiry = useCallback(() => {
    if (!user?.subscriptionExpiresAt) {
      return '无订阅'
    }

    const expiryDate = new Date(user.subscriptionExpiresAt)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return '已过期'
    } else if (diffDays === 0) {
      return '今天到期'
    } else if (diffDays <= 7) {
      return `${diffDays}天后到期`
    } else {
      return expiryDate.toLocaleDateString('zh-CN')
    }
  }, [user])

  /**
   * Auto-refresh user data on mount if authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      // Refresh user data every 5 minutes
      const interval = setInterval(
        () => {
          storeRefreshUser()
        },
        5 * 60 * 1000
      )

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user, storeRefreshUser])

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    // If token exists in localStorage but not in store, rehydrate
    const token = localStorage.getItem('auth_token')
    if (token && !isAuthenticated && !isLoading) {
      console.log('Rehydrating auth from localStorage...')
      // The store's onRehydrateStorage should handle this
    }
  }, [isAuthenticated, isLoading])

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,

    // Actions
    login,
    logout,
    register,
    updateUser: storeUpdateUser,
    refreshUser: storeRefreshUser,
    clearError: storeClearError,
    reset: storeReset,

    // Utilities
    isAdmin,
    hasRole,
    getRemainingCredits,
    hasSufficientCredits,
    formatSubscriptionExpiry,
  }
}

/**
 * Hook for protected route authentication checks
 */
export const useProtectedRoute = (requiredRole?: string | string[]) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login', {
          replace: true,
          state: { from: location },
        })
      } else if (requiredRole) {
        // Check role if required
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(user?.role || '')
          : user?.role === requiredRole

        if (!hasRequiredRole) {
          // Redirect to unauthorized page or dashboard
          navigate('/unauthorized', { replace: true })
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate, location])

  return {
    isAuthenticated,
    user,
    isLoading,
    hasRequiredRole: requiredRole
      ? Array.isArray(requiredRole)
        ? requiredRole.includes(user?.role || '')
        : user?.role === requiredRole
      : true,
  }
}

/**
 * Hook for checking authentication status without side effects
 */
export const useAuthStatus = () => {
  const isAuthenticated = useIsAuthenticated()
  const user = useCurrentUser()
  const isLoading = useAuthLoading()

  return {
    isAuthenticated,
    user,
    isLoading,
  }
}

/**
 * Hook for login page logic
 */
export const useLoginForm = () => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const { login, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!username.trim() || !password.trim()) {
      return
    }

    try {
      await login({ username, password, rememberMe })
    } catch (err) {
      // Error handled by store
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    handleSubmit,
    isLoading,
    error,
    clearError,
  }
}

// Import React for useState
import React from 'react'
