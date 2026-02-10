import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getItem,
  setItem,
  removeItem,
  clearStorage,
  getItems,
  setItems,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getAuthUser,
  setAuthUser,
  clearAuthData,
  getApiKeys,
  setApiKeys,
  updateApiKey,
  removeApiKey,
  getTheme,
  setTheme,
  getLanguage,
  setLanguage,
  getSidebarState,
  setSidebarState,
  getModuleHistory,
  addToModuleHistory,
  clearModuleHistory,
  isStorageAvailable,
  getStorageUsage,
  STORAGE_KEYS,
} from '../../utils/storage'

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }

    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getItem', () => {
    it('should return parsed value from localStorage', () => {
      const testValue = { name: 'test' }
      localStorage.getItem.mockReturnValue(JSON.stringify(testValue))

      const result = getItem('test-key')
      expect(result).toEqual(testValue)
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return default value when item does not exist', () => {
      localStorage.getItem.mockReturnValue(null)

      const result = getItem('test-key', 'local', 'default')
      expect(result).toBe('default')
    })

    it('should return default value when JSON parsing fails', () => {
      localStorage.getItem.mockReturnValue('invalid-json')

      const result = getItem('test-key', 'local', 'default')
      expect(result).toBe('default')
    })

    it('should work with sessionStorage', () => {
      const testValue = { name: 'session-test' }
      sessionStorage.getItem.mockReturnValue(JSON.stringify(testValue))

      const result = getItem('test-key', 'session')
      expect(result).toEqual(testValue)
      expect(sessionStorage.getItem).toHaveBeenCalledWith('test-key')
    })
  })

  describe('setItem', () => {
    it('should stringify and store value in localStorage', () => {
      const testValue = { name: 'test' }

      const result = setItem('test-key', testValue)
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testValue))
    })

    it('should return false when storage fails', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage failed')
      })

      const result = setItem('test-key', 'value')
      expect(result).toBe(false)
    })

    it('should work with sessionStorage', () => {
      const testValue = { name: 'session-test' }

      const result = setItem('test-key', testValue, 'session')
      expect(result).toBe(true)
      expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testValue))
    })
  })

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      const result = removeItem('test-key')
      expect(result).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should return false when removal fails', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Removal failed')
      })

      const result = removeItem('test-key')
      expect(result).toBe(false)
    })
  })

  describe('clearStorage', () => {
    it('should clear localStorage', () => {
      const result = clearStorage()
      expect(result).toBe(true)
      expect(localStorage.clear).toHaveBeenCalled()
    })
  })

  describe('getItems', () => {
    it('should get multiple items', () => {
      localStorage.getItem
        .mockReturnValueOnce(JSON.stringify('value1'))
        .mockReturnValueOnce(JSON.stringify('value2'))

      const result = getItems(['key1', 'key2'])
      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      })
    })
  })

  describe('setItems', () => {
    it('should set multiple items', () => {
      const items = {
        key1: 'value1',
        key2: 'value2',
      }

      const result = setItems(items)
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledTimes(2)
      expect(localStorage.setItem).toHaveBeenCalledWith('key1', JSON.stringify('value1'))
      expect(localStorage.setItem).toHaveBeenCalledWith('key2', JSON.stringify('value2'))
    })
  })

  describe('Auth functions', () => {
    it('getAuthToken should call getItem with AUTH_TOKEN key', () => {
      getAuthToken()
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN)
    })

    it('setAuthToken should call setItem with AUTH_TOKEN key', () => {
      setAuthToken('test-token')
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify('test-token'))
    })

    it('removeAuthToken should call removeItem with AUTH_TOKEN key', () => {
      removeAuthToken()
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN)
    })

    it('clearAuthData should remove both token and user', () => {
      clearAuthData()
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN)
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_USER)
    })
  })

  describe('API Keys functions', () => {
    it('getApiKeys should return empty object when no keys stored', () => {
      localStorage.getItem.mockReturnValue(null)
      const result = getApiKeys()
      expect(result).toEqual({})
    })

    it('setApiKeys should store keys', () => {
      const keys = { gemini: 'key1', gptzero: 'key2' }
      setApiKeys(keys)
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEYS, JSON.stringify(keys))
    })

    it('updateApiKey should update specific key', () => {
      const existingKeys = { gemini: 'old-key' }
      localStorage.getItem.mockReturnValue(JSON.stringify(existingKeys))

      updateApiKey('gemini', 'new-key')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.API_KEYS,
        JSON.stringify({ gemini: 'new-key' })
      )
    })

    it('removeApiKey should remove specific key', () => {
      const existingKeys = { gemini: 'key1', gptzero: 'key2' }
      localStorage.getItem.mockReturnValue(JSON.stringify(existingKeys))

      removeApiKey('gemini')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.API_KEYS,
        JSON.stringify({ gptzero: 'key2' })
      )
    })
  })

  describe('Theme and Language functions', () => {
    it('getTheme should return auto by default', () => {
      localStorage.getItem.mockReturnValue(null)
      const result = getTheme()
      expect(result).toBe('auto')
    })

    it('setTheme should store theme', () => {
      setTheme('dark')
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME, JSON.stringify('dark'))
    })

    it('getLanguage should return en by default', () => {
      localStorage.getItem.mockReturnValue(null)
      const result = getLanguage()
      expect(result).toBe('en')
    })
  })

  describe('Module History functions', () => {
    it('getModuleHistory should return empty array for undefined module', () => {
      localStorage.getItem.mockReturnValue(null)
      const result = getModuleHistory('undefined-module')
      expect(result).toEqual([])
    })

    it('addToModuleHistory should add item to history', () => {
      localStorage.getItem.mockReturnValue(null)

      addToModuleHistory('module1', { id: 1, name: 'test' })
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MODULE1_HISTORY,
        JSON.stringify([{ id: 1, name: 'test' }])
      )
    })

    it('addToModuleHistory should limit history size', () => {
      const existingHistory = Array.from({ length: 60 }, (_, i) => ({ id: i }))
      localStorage.getItem.mockReturnValue(JSON.stringify(existingHistory))

      addToModuleHistory('module1', { id: 61 }, 50)

      // Should have 50 items max, with new item first
      const expectedHistory = [{ id: 61 }, ...existingHistory.slice(0, 49)]
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MODULE1_HISTORY,
        JSON.stringify(expectedHistory)
      )
    })
  })

  describe('isStorageAvailable', () => {
    it('should return true when storage is available', () => {
      const result = isStorageAvailable()
      expect(result).toBe(true)
    })

    it('should return false when storage fails', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage failed')
      })

      const result = isStorageAvailable()
      expect(result).toBe(false)
    })
  })

  describe('getStorageUsage', () => {
    beforeEach(() => {
      // Mock navigator.storage.estimate
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: vi.fn(),
        },
        writable: true,
      })
    })

    it('should return null when storage API not available', () => {
      Object.defineProperty(navigator, 'storage', { value: undefined })

      const result = getStorageUsage()
      expect(result).toBeNull()
    })

    it('should calculate storage usage', () => {
      // Mock storage items
      localStorage.length = 2
      localStorage.key
        .mockReturnValueOnce('key1')
        .mockReturnValueOnce('key2')
      localStorage.getItem
        .mockReturnValueOnce('value1')
        .mockReturnValueOnce('value2')

      const result = getStorageUsage()
      expect(result).toBeTruthy()
      expect(result?.used).toBeGreaterThan(0)
      expect(result?.quota).toBe(5) // Default quota for localStorage
    })
  })
})