/**
 * API client and endpoints index
 */

export { apiClient, api } from './client'
export type {
  ApiResponse,
  ApiError,
  ValidationError,
  PaginationParams,
  LoginCredentials,
  AuthResponse,
  User,
  ApiKeys,
  Module1Data,
  Module2Data,
  Module3Data,
  TodoResponse,
} from './types'
export { ENDPOINTS } from './endpoints'
export default apiClient
