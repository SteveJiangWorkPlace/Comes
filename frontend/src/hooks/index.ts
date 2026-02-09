/**
 * Hooks exports
 * Centralized export point for all custom React hooks
 */

// Authentication hooks
export * from './useAuth'
export { useAuth, useProtectedRoute, useAuthStatus, useLoginForm } from './useAuth'

// API Keys hooks
export * from './useApiKeys'
export { useApiKeys, useApiKeyForm, API_KEY_CONFIGS } from './useApiKeys'

/**
 * Type exports for hooks
 */
export type { ApiKeyType, ApiKeyConfig } from './useApiKeys'

/**
 * Hook utilities
 */

/**
 * Custom hook for handling form state
 */
export const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setForm(prev => ({ ...prev, [field]: value }))
      setTouched(prev => ({ ...prev, [field]: true }))

      // Clear error when field is changed
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const validate = useCallback(
    (validators: Partial<Record<keyof T, (value: any) => string | null>>) => {
      const newErrors: Partial<Record<keyof T, string>> = {}

      Object.entries(validators).forEach(([field, validator]) => {
        if (validator) {
          const error = validator(form[field])
          if (error) {
            newErrors[field as keyof T] = error
          }
        }
      })

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [form]
  )

  const reset = useCallback(() => {
    setForm(initialState)
    setErrors({})
    setTouched({})
  }, [initialState])

  return {
    form,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldError,
    validate,
    reset,
    setForm,
    setErrors,
    setTouched,
  }
}

/**
 * Custom hook for handling loading states
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true)
    try {
      const result = await promise
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    setIsLoading,
    withLoading,
  }
}

/**
 * Custom hook for handling errors
 */
export const useError = () => {
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err: any) => {
    const message = err.response?.data?.message || err.message || '发生未知错误'
    setError(message)
    return message
  }, [])

  return {
    error,
    setError,
    clearError,
    handleError,
  }
}

// Import React for useState and useCallback
import { useState, useCallback } from 'react'
