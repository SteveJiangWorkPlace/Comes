import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../../store/auth.store'
import { apiClient } from '../../api/client'
import { User } from '../../api/types'

// Mock API client
vi.mock('../../api/client', () => ({
  apiClient: {
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear all mocks and reset localStorage
    vi.clearAllMocks()
    localStorage.clear()

    // Reset store to initial state
    act(() => {
      useAuthStore.getState().reset()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Login Action', () => {
    it('should login successfully with mock data', async () => {
      const { result } = renderHook(() => useAuthStore())
      const credentials = { username: 'testuser', password: 'password123' }

      // Mock localStorage.setItem
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      await act(async () => {
        await result.current.login(credentials)
      })

      // Check state updates
      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.username).toBe('testuser')
      expect(result.current.token).toContain('mock-jwt-token-')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()

      // Check localStorage was updated
      expect(setItemSpy).toHaveBeenCalledWith('auth_token', expect.stringContaining('mock-jwt-token-'))

      // Check API client was configured
      expect(apiClient.defaults.headers.common['Authorization']).toContain('Bearer mock-jwt-token-')
    })

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuthStore())
      const credentials = { username: 'testuser', password: 'wrongpassword' }

      // Mock login to throw error
      const originalLogin = result.current.login
      vi.spyOn(result.current, 'login').mockImplementation(async () => {
        throw new Error('Invalid credentials')
      })

      await act(async () => {
        try {
          await result.current.login(credentials)
        } catch (error) {
          // Expected
        }
      })

      // Check error state
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Logout Action', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAuthStore())

      // First login
      await act(async () => {
        await result.current.login({ username: 'testuser', password: 'password123' })
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Mock localStorage.removeItem
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      // Check state reset
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)

      // Check localStorage cleared
      expect(removeItemSpy).toHaveBeenCalledWith('auth_token')

      // Check API client cleared
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })

  describe('Register Action', () => {
    it('should register successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      }

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      await act(async () => {
        await result.current.register(registerData)
      })

      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.username).toBe('newuser')
      expect(result.current.user?.email).toBe('newuser@example.com')
      expect(result.current.user?.role).toBe('user')
      expect(result.current.user?.remainingCredits).toBe(10) // New users get 10 credits
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)

      expect(setItemSpy).toHaveBeenCalledWith('auth_token', expect.stringContaining('mock-jwt-token-register-'))
      expect(apiClient.defaults.headers.common['Authorization']).toContain('Bearer mock-jwt-token-register-')
    })
  })

  describe('Refresh User Action', () => {
    it('should refresh user data', async () => {
      const { result } = renderHook(() => useAuthStore())

      // First login
      await act(async () => {
        await result.current.login({ username: 'testuser', password: 'password123' })
      })

      const initialCredits = result.current.user?.remainingCredits || 0

      await act(async () => {
        await result.current.refreshUser()
      })

      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.remainingCredits).toBe(initialCredits - 1) // Simulated credit usage
      expect(result.current.isLoading).toBe(false)
    })

    it('should not refresh if not authenticated', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Not logged in
      expect(result.current.isAuthenticated).toBe(false)

      await act(async () => {
        await result.current.refreshUser()
      })

      // State should remain unchanged
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Update User Action', () => {
    it('should update user data', async () => {
      const { result } = renderHook(() => useAuthStore())

      // First login
      await act(async () => {
        await result.current.login({ username: 'testuser', password: 'password123' })
      })

      const updates = {
        fullName: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg'
      }

      await act(async () => {
        await result.current.updateUser(updates)
      })

      expect(result.current.user?.fullName).toBe('Updated Name')
      expect(result.current.user?.avatar).toBe('https://example.com/new-avatar.jpg')
      expect(result.current.isLoading).toBe(false)
    })

    it('should not update if not authenticated', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Not logged in
      expect(result.current.isAuthenticated).toBe(false)

      const updates = { fullName: 'New Name' }

      await act(async () => {
        await result.current.updateUser(updates)
      })

      // State should remain unchanged
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Clear Error Action', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAuthStore())

      // Set error
      act(() => {
        result.current.error = 'Some error'
      })

      expect(result.current.error).toBe('Some error')

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Persistence', () => {
    it('should persist auth state to localStorage', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Login to trigger persistence
      await act(async () => {
        await result.current.login({ username: 'testuser', password: 'password123' })
      })

      // Check that localStorage was updated (persist middleware should handle this)
      // The actual persistence is handled by Zustand's persist middleware
      // We can verify by checking that our mock setItem was called with the store key
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should rehydrate from localStorage', () => {
      // Simulate stored auth state
      const storedState = {
        state: {
          user: {
            id: 'user-123',
            username: 'storeduser',
            email: 'stored@example.com',
            fullName: 'Stored User',
            role: 'user',
            remainingCredits: 50,
            subscriptionExpiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: 'stored-token-123',
          isAuthenticated: true
        },
        version: 0
      }

      // Store in localStorage
      localStorage.setItem('auth-storage', JSON.stringify(storedState))

      // Create new store instance (simulating page reload)
      const { result } = renderHook(() => useAuthStore())

      // Check that state was rehydrated
      expect(result.current.user?.username).toBe('storeduser')
      expect(result.current.token).toBe('stored-token-123')
      expect(result.current.isAuthenticated).toBe(true)

      // Check that API client was configured with stored token
      expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer stored-token-123')
    })
  })

  describe('Utility Hooks', () => {
    it('useIsAuthenticated should return authentication status', () => {
      const { result: store } = renderHook(() => useAuthStore())

      // Initially false
      const { result: authHook } = renderHook(() => {
        const isAuthenticated = store.current.isAuthenticated
        return isAuthenticated
      })

      expect(authHook.current).toBe(false)

      // Simulate login
      act(() => {
        store.current.isAuthenticated = true
      })

      expect(authHook.current).toBe(true)
    })

    it('useCurrentUser should return current user', () => {
      const { result: store } = renderHook(() => useAuthStore())

      // Initially null
      const { result: userHook } = renderHook(() => {
        const user = store.current.user
        return user
      })

      expect(userHook.current).toBeNull()

      // Simulate user set
      const testUser: User = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'user',
        remainingCredits: 100,
        subscriptionExpiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      act(() => {
        store.current.user = testUser
      })

      expect(userHook.current).toEqual(testUser)
    })
  })
})