/**
 * Module related TypeScript definitions
 */

/**
 * Base module state interface
 */
export interface BaseModuleState<T = any> {
  data: T | null
  isLoading: boolean
  error: string | null
  history: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}

/**
 * Module 1 specific state
 */
export interface Module1State extends BaseModuleState<Module1Data> {
  inputText: string
  resultText: string
  processingTime: number
  // Additional module 1 specific fields
}

/**
 * Module 2 specific state
 */
export interface Module2State extends BaseModuleState<Module2Data> {
  inputText: string
  resultText: string
  processingTime: number
  // Additional module 2 specific fields
}

/**
 * Module 3 specific state
 */
export interface Module3State extends BaseModuleState<Module3Data> {
  inputText: string
  resultText: string
  processingTime: number
  // Additional module 3 specific fields
}

/**
 * Module 1 data structure (placeholder)
 */
export interface Module1Data {
  id: string
  input: string
  output: string
  confidence: number
  processingTime: number
  createdAt: string
  metadata?: {
    // TODO: Define module 1 specific metadata
    [key: string]: any
  }
}

/**
 * Module 2 data structure (placeholder)
 */
export interface Module2Data {
  id: string
  input: string
  output: string
  confidence: number
  processingTime: number
  createdAt: string
  metadata?: {
    // TODO: Define module 2 specific metadata
    [key: string]: any
  }
}

/**
 * Module 3 data structure (placeholder)
 */
export interface Module3Data {
  id: string
  input: string
  output: string
  confidence: number
  processingTime: number
  createdAt: string
  metadata?: {
    // TODO: Define module 3 specific metadata
    [key: string]: any
  }
}

/**
 * Module processing request
 */
export interface ModuleProcessRequest {
  input: string
  options?: {
    // TODO: Define module processing options
    [key: string]: any
  }
}

/**
 * Module processing response
 */
export interface ModuleProcessResponse {
  id: string
  input: string
  output: string
  confidence: number
  processingTime: number
  warnings?: string[]
  metadata?: {
    [key: string]: any
  }
}

/**
 * Module history item
 */
export interface ModuleHistoryItem {
  id: string
  module: string
  inputPreview: string
  outputPreview: string
  createdAt: string
  processingTime: number
}

/**
 * Module configuration
 */
export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  permissions: string[]
  maxInputLength: number
  rateLimit: number
  // Additional configuration options
}
