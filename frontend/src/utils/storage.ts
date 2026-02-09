/**
 * Storage utilities for Comes application
 * Provides a typed interface for localStorage and sessionStorage
 */

/**
 * Storage types
 */
export type StorageType = 'local' | 'session'

/**
 * Storage key constants
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  API_KEYS: 'comes_api_keys',
  THEME: 'comes_theme',
  LANGUAGE: 'comes_language',
  SIDEBAR_STATE: 'comes_sidebar_state',
  MODULE1_HISTORY: 'comes_module1_history',
  MODULE2_HISTORY: 'comes_module2_history',
  MODULE3_HISTORY: 'comes_module3_history',
} as const

/**
 * Gets the storage instance based on type
 */
const getStorage = (type: StorageType = 'local'): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

/**
 * Safely gets an item from storage
 */
export const getItem = <T = any>(
  key: string,
  type: StorageType = 'local',
  defaultValue: T | null = null
): T | null => {
  try {
    const storage = getStorage(type)
    const item = storage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from ${type}Storage:`, error)
    return defaultValue
  }
}

/**
 * Safely sets an item in storage
 */
export const setItem = (key: string, value: any, type: StorageType = 'local'): boolean => {
  try {
    const storage = getStorage(type)
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to ${type}Storage:`, error)
    return false
  }
}

/**
 * Safely removes an item from storage
 */
export const removeItem = (key: string, type: StorageType = 'local'): boolean => {
  try {
    const storage = getStorage(type)
    storage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from ${type}Storage:`, error)
    return false
  }
}

/**
 * Safely clears all items from storage (for current domain)
 */
export const clearStorage = (type: StorageType = 'local'): boolean => {
  try {
    const storage = getStorage(type)
    storage.clear()
    return true
  } catch (error) {
    console.error(`Error clearing ${type}Storage:`, error)
    return false
  }
}

/**
 * Gets multiple items from storage at once
 */
export const getItems = <T = any>(
  keys: string[],
  type: StorageType = 'local'
): Record<string, T | null> => {
  const result: Record<string, T | null> = {}
  keys.forEach(key => {
    result[key] = getItem<T>(key, type)
  })
  return result
}

/**
 * Sets multiple items in storage at once
 */
export const setItems = (items: Record<string, any>, type: StorageType = 'local'): boolean => {
  try {
    Object.entries(items).forEach(([key, value]) => {
      setItem(key, value, type)
    })
    return true
  } catch (error) {
    console.error(`Error writing multiple items to ${type}Storage:`, error)
    return false
  }
}

/**
 * Gets the authentication token
 */
export const getAuthToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Sets the authentication token
 */
export const setAuthToken = (token: string): boolean => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token)
}

/**
 * Removes the authentication token
 */
export const removeAuthToken = (): boolean => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Gets the authenticated user
 */
export const getAuthUser = <T = any>(): T | null => {
  return getItem<T>(STORAGE_KEYS.AUTH_USER)
}

/**
 * Sets the authenticated user
 */
export const setAuthUser = (user: any): boolean => {
  return setItem(STORAGE_KEYS.AUTH_USER, user)
}

/**
 * Removes the authenticated user
 */
export const removeAuthUser = (): boolean => {
  return removeItem(STORAGE_KEYS.AUTH_USER)
}

/**
 * Clears all authentication data
 */
export const clearAuthData = (): void => {
  removeAuthToken()
  removeAuthUser()
}

/**
 * Gets API keys
 */
export const getApiKeys = (): Record<string, string> => {
  return getItem<Record<string, string>>(STORAGE_KEYS.API_KEYS) || {}
}

/**
 * Sets API keys
 */
export const setApiKeys = (keys: Record<string, string>): boolean => {
  return setItem(STORAGE_KEYS.API_KEYS, keys)
}

/**
 * Updates a specific API key
 */
export const updateApiKey = (service: string, key: string): boolean => {
  const keys = getApiKeys()
  keys[service] = key
  return setApiKeys(keys)
}

/**
 * Removes a specific API key
 */
export const removeApiKey = (service: string): boolean => {
  const keys = getApiKeys()
  delete keys[service]
  return setApiKeys(keys)
}

/**
 * Gets theme preference
 */
export const getTheme = (): 'light' | 'dark' | 'auto' => {
  return getItem<'light' | 'dark' | 'auto'>(STORAGE_KEYS.THEME) || 'auto'
}

/**
 * Sets theme preference
 */
export const setTheme = (theme: 'light' | 'dark' | 'auto'): boolean => {
  return setItem(STORAGE_KEYS.THEME, theme)
}

/**
 * Gets language preference
 */
export const getLanguage = (): string => {
  return getItem<string>(STORAGE_KEYS.LANGUAGE) || 'en'
}

/**
 * Sets language preference
 */
export const setLanguage = (language: string): boolean => {
  return setItem(STORAGE_KEYS.LANGUAGE, language)
}

/**
 * Gets sidebar state (collapsed or expanded)
 */
export const getSidebarState = (): boolean => {
  return getItem<boolean>(STORAGE_KEYS.SIDEBAR_STATE) || false
}

/**
 * Sets sidebar state
 */
export const setSidebarState = (collapsed: boolean): boolean => {
  return setItem(STORAGE_KEYS.SIDEBAR_STATE, collapsed)
}

/**
 * Gets module history
 */
export const getModuleHistory = <T = any>(module: string): T[] => {
  const key = `comes_${module}_history` as keyof typeof STORAGE_KEYS
  if (!STORAGE_KEYS[key]) {
    console.warn(`No storage key defined for module: ${module}`)
    return []
  }
  return getItem<T[]>(STORAGE_KEYS[key]) || []
}

/**
 * Adds an item to module history
 */
export const addToModuleHistory = <T = any>(
  module: string,
  item: T,
  maxItems: number = 50
): boolean => {
  const key = `comes_${module}_history` as keyof typeof STORAGE_KEYS
  if (!STORAGE_KEYS[key]) {
    console.warn(`No storage key defined for module: ${module}`)
    return false
  }

  const history = getModuleHistory<T>(module)
  const newHistory = [item, ...history].slice(0, maxItems)
  return setItem(STORAGE_KEYS[key], newHistory)
}

/**
 * Clears module history
 */
export const clearModuleHistory = (module: string): boolean => {
  const key = `comes_${module}_history` as keyof typeof STORAGE_KEYS
  if (!STORAGE_KEYS[key]) {
    console.warn(`No storage key defined for module: ${module}`)
    return false
  }
  return setItem(STORAGE_KEYS[key], [])
}

/**
 * Checks if storage is available
 */
export const isStorageAvailable = (type: StorageType = 'local'): boolean => {
  try {
    const storage = getStorage(type)
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Gets storage usage statistics
 */
export const getStorageUsage = (
  type: StorageType = 'local'
): {
  used: number
  quota: number
  percentage: number
} | null => {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null
  }

  try {
    const storage = getStorage(type)
    let used = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        used += (key.length + (storage.getItem(key)?.length || 0)) * 2
      }
    }

    // Convert to MB
    const usedMB = used / (1024 * 1024)

    // Get quota (this is approximate for localStorage)
    const quotaMB = type === 'local' ? 5 : 5 // Typical browser limits

    return {
      used: usedMB,
      quota: quotaMB,
      percentage: (usedMB / quotaMB) * 100,
    }
  } catch (error) {
    console.error('Error getting storage usage:', error)
    return null
  }
}
