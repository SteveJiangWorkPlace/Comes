/**
 * API endpoint definitions for Comes application
 * These are placeholder endpoints that will be implemented later
 */

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/auth/profile',
}

// User management endpoints
export const USER_ENDPOINTS = {
  GET_USERS: '/users',
  GET_USER: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,
  UPDATE_CREDITS: (id: string) => `/users/${id}/credits`,
}



// Student Application Information endpoints
export const STUDENT_APPLICATION_ENDPOINTS = {
  LIST: '/api/student-applications',
  UPLOAD: '/api/student-applications/upload',
  ANALYZE: (id: string) => `/api/student-applications/analyze/${id}`,
  GET_APPLICATION: (id: string) => `/api/student-applications/${id}`,
  GET_TEMPLATE: '/api/student-applications/template',
}

// Transcript Verification endpoints
export const TRANSCRIPT_VERIFICATION_ENDPOINTS = {
  LIST: '/api/student-applications/transcript',
  UPLOAD: '/api/student-applications/transcript/upload',
  VERIFY: (id: string) => `/api/student-applications/transcript/verify/${id}`,
  GET_VERIFICATION: (id: string) => `/api/student-applications/transcript/${id}`,
}

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  STATISTICS: '/admin/statistics',
  SETTINGS: '/admin/settings',
}

// API keys management endpoints
export const API_KEYS_ENDPOINTS = {
  GET_KEYS: '/api-keys',
  UPDATE_KEYS: '/api-keys',
  VALIDATE_KEY: (service: string) => `/api-keys/validate/${service}`,
}

// System endpoints
export const SYSTEM_ENDPOINTS = {
  HEALTH: '/health',
  VERSION: '/version',
  CONFIG: '/config',
}


// Export all endpoints
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  STUDENT_APPLICATION: STUDENT_APPLICATION_ENDPOINTS,
  TRANSCRIPT_VERIFICATION: TRANSCRIPT_VERIFICATION_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  API_KEYS: API_KEYS_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
} as const

export default ENDPOINTS
