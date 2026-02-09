/**
 * Authentication store using Zustand
 * Handles user authentication state, login, logout, and token management
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../api/client'
import { AuthResponse, LoginCredentials, User } from '../api/types'
import { AuthState, LoginFormData } from '../types/auth.types'

// Default initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

/**
 * Authentication store interface
 */
interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginFormData) => Promise<void>
  logout: () => Promise<void>
  register: (data: { username: string; email: string; password: string }) => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  clearError: () => void
  reset: () => void
}

/**
 * Create authentication store with persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Actions
      login: async (credentials: LoginFormData) => {
        set({ isLoading: true, error: null })

        try {
          // Format credentials for API
          const loginCredentials: LoginCredentials = {
            username: credentials.username,
            password: credentials.password,
          }

          // In production, this would call the real API
          // For now, simulate API call with mock data
          await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay

          // Mock response - in real app this would come from api.post('/auth/login', loginCredentials)
          const mockResponse: AuthResponse = {
            user: {
              id: 'user-123',
              username: credentials.username,
              email: `${credentials.username}@example.com`,
              fullName: 'Demo User',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + credentials.username,
              role: credentials.username === 'admin' ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              remainingCredits: 100,
              subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            },
            token: 'mock-jwt-token-' + Date.now(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            refreshToken: 'mock-refresh-token-' + Date.now(),
          }

          // Update state with auth response
          set({
            user: mockResponse.user,
            token: mockResponse.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Store token in localStorage for API client
          localStorage.setItem('auth_token', mockResponse.token)

          // Configure API client with new token
          api.defaults.headers.common['Authorization'] = `Bearer ${mockResponse.token}`

          console.log('Login successful:', mockResponse.user.username)
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false,
          })
          console.error('Login error:', error)
          throw error
        }
      },

      logout: async () => {
        try {
          // In production, this would call the logout endpoint
          // api.post('/auth/logout')

          // Clear token from API client
          delete api.defaults.headers.common['Authorization']
          localStorage.removeItem('auth_token')

          // Reset to initial state
          set(initialState)

          console.log('Logout successful')
        } catch (error: any) {
          console.error('Logout error:', error)
          // Even if logout API fails, clear local state
          delete api.defaults.headers.common['Authorization']
          localStorage.removeItem('auth_token')
          set(initialState)
        }
      },

      register: async data => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Mock response
          const mockResponse: AuthResponse = {
            user: {
              id: 'user-' + Date.now(),
              username: data.username,
              email: data.email,
              fullName: data.username,
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              remainingCredits: 10, // New users get 10 credits
              subscriptionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 day trial
            },
            token: 'mock-jwt-token-register-' + Date.now(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }

          set({
            user: mockResponse.user,
            token: mockResponse.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          localStorage.setItem('auth_token', mockResponse.token)
          api.defaults.headers.common['Authorization'] = `Bearer ${mockResponse.token}`

          console.log('Registration successful:', data.username)
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          console.error('Registration error:', error)
          throw error
        }
      },

      refreshUser: async () => {
        const { user, token } = get()
        if (!user || !token) return

        set({ isLoading: true, error: null })

        try {
          // Simulate API call to refresh user data
          await new Promise(resolve => setTimeout(resolve, 500))

          // Mock updated user data
          const updatedUser: User = {
            ...user,
            updatedAt: new Date().toISOString(),
            remainingCredits: Math.max(0, (user.remainingCredits || 0) - 1), // Simulate credit usage
          }

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })

          console.log('User data refreshed')
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to refresh user data'
          set({
            isLoading: false,
            error: errorMessage,
          })
          console.error('Refresh user error:', error)
        }
      },

      updateUser: async updates => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))

          const updatedUser: User = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })

          console.log('User updated successfully')
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to update user'
          set({
            isLoading: false,
            error: errorMessage,
          })
          console.error('Update user error:', error)
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      reset: () => {
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('auth_token')
        set(initialState)
      },
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // Called after rehydration
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth store:', error)
          } else if (state?.token) {
            // Restore token to API client
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          }
        }
      },
    }
  )
)

/**
 * Authentication store hooks for common use cases
 */
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useCurrentUser = () => useAuthStore(state => state.user)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useAuthError = () => useAuthStore(state => state.error)
