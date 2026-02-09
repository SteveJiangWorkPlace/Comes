/**
 * Store exports
 * Centralized export point for all Zustand stores
 */

// Authentication store
export * from './auth.store'
export {
  useAuthStore,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useAuthError,
} from './auth.store'

// Module 1 store
export * from './module1.store'
export { useModule1Store } from './module1.store'

// Module 2 store
export * from './module2.store'
export { useModule2Store } from './module2.store'

// Module 3 store
export * from './module3.store'
export { useModule3Store } from './module3.store'

/**
 * Utility functions for store management
 */

/**
 * Resets all stores (useful for testing or logout)
 */
export const resetAllStores = () => {
  // Note: In a real app, you would call each store's reset method
  // This is a placeholder for future implementation
  console.log('Resetting all stores...')
  // This would be implemented when store reset methods are available
}

/**
 * Subscribe to store changes for debugging
 */
export const debugStoreChanges = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Store debugging enabled')
    // Example: You could subscribe to store changes here
  }
}

/**
 * Persistence configuration for stores
 */
export const storePersistConfig = {
  auth: {
    name: 'auth-storage',
    version: 1,
  },
  module1: {
    name: 'module1-storage',
    version: 1,
  },
  module2: {
    name: 'module2-storage',
    version: 1,
  },
  module3: {
    name: 'module3-storage',
    version: 1,
  },
} as const

/**
 * Type exports for store states
 */
export type { AuthState } from './auth.store'
export type { Module1State } from './module1.store'
export type { Module2State } from './module2.store'
export type { Module3State } from './module3.store'
