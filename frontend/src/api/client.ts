import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse, ApiError } from './types'

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // Request interceptor
  apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Add authorization token if available
      const token = localStorage.getItem('auth_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add API keys for external services if available
      const apiKeys = JSON.parse(localStorage.getItem('comes_api_keys') || '{}')
      if (apiKeys.geminiApiKey && config.headers) {
        config.headers['X-Gemini-Api-Key'] = apiKeys.geminiApiKey
      }
      if (apiKeys.gptzeroApiKey && config.headers) {
        config.headers['X-Gptzero-Api-Key'] = apiKeys.gptzeroApiKey
      }

      // Log request in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
      }

      return config
    },
    (error: AxiosError) => {
      console.error('[API Request Error]', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
      // Log response in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
      }

      // Handle standard API response format
      if (response.data && typeof response.data === 'object') {
        // You can add additional response transformation here
        return response
      }

      return response
    },
    (error: AxiosError<ApiError>) => {
      // Log error
      console.error('[API Response Error]', error)

      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const data = error.response.data

        switch (status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
            break
          case 403:
            // Forbidden
            console.error('Access forbidden')
            break
          case 404:
            // Not found
            console.error('Resource not found')
            break
          case 500:
            // Server error
            console.error('Server error occurred')
            break
        }

        // Create a standardized error object
        const apiError: ApiError = {
          message: data?.message || error.message || 'An error occurred',
          status,
          code: data?.code || 'UNKNOWN_ERROR',
          details: data?.details,
        }

        return Promise.reject(apiError)
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received from server')
        return Promise.reject({
          message: 'No response received from server. Please check your network connection.',
          status: 0,
          code: 'NETWORK_ERROR',
        })
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message)
        return Promise.reject({
          message: error.message || 'Error setting up request',
          status: 0,
          code: 'REQUEST_SETUP_ERROR',
        })
      }
    }
  )

  return apiClient
}

// Export the configured api client
export const apiClient = createApiClient()

// Helper functions for common HTTP methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then(res => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then(res => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then(res => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then(res => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data),
}

export default apiClient
