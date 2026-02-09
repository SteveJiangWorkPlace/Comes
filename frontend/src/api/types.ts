/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  metadata?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
    [key: string]: any
  }
}

/**
 * Standard API error format
 */
export interface ApiError {
  message: string
  status: number
  code: string
  details?: any
  validationErrors?: ValidationError[]
}

/**
 * Validation error for form fields
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

/**
 * Authentication types
 */
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresAt: string
  refreshToken?: string
}

export interface User {
  id: string
  username: string
  email?: string
  fullName?: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
  remainingCredits?: number
  subscriptionExpiresAt?: string
}

/**
 * API keys for external services
 */
export interface ApiKeys {
  geminiApiKey?: string
  gptzeroApiKey?: string
  [key: string]: string | undefined
}

/**
 * Module-specific types (placeholder)
 */
export interface Module1Data {
  id: string
  // TODO: Define module 1 data structure
  [key: string]: any
}

export interface Module2Data {
  id: string
  // TODO: Define module 2 data structure
  [key: string]: any
}

export interface Module3Data {
  id: string
  // TODO: Define module 3 data structure
  [key: string]: any
}

/**
 * Generic response types for placeholder endpoints
 */
export interface TodoResponse {
  success: true
  message: string
  data: {
    placeholder: boolean
    module: string
    timestamp: string
  }
}

/**
 * Student Application Information types
 */
export interface StudentApplicationFile {
  filename: string
  filepath: string
  content_type: string
}

export interface StudentApplication {
  id: string
  files: Record<string, StudentApplicationFile>
  status: 'pending' | 'uploaded' | 'analyzing' | 'analyzed' | 'completed' | 'failed'
  analysis_result?: any
  structured_summary?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface UploadFilesRequest {
  transcript: File
  degree_certificate: File
  resume: File
  ielts_score: File
}

export interface UploadFilesResponse {
  message: string
  application_id: string
  uploaded_files: Record<string, string>
  next_step: {
    analyze: string
    status: string
  }
}

export interface AnalyzeResponse {
  message: string
  application_id: string
  status: string
  analysis_summary: string
}

export interface TemplateResponse {
  template: string
}
