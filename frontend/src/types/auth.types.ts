/**
 * Authentication related TypeScript definitions
 */

import { User } from '../api/types'

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Login form data
 */
export interface LoginFormData {
  username: string
  password: string
  rememberMe: boolean
}

/**
 * Registration form data
 */
export interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName?: string
}

/**
 * Password reset form data
 */
export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
  token: string
}

/**
 * Forgot password form data
 */
export interface ForgotPasswordFormData {
  email: string
}

/**
 * User profile update form data
 */
export interface ProfileUpdateFormData {
  fullName?: string
  email?: string
  avatar?: File | null
  currentPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginFormData) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  updateProfile: (data: ProfileUpdateFormData) => Promise<void>
  refreshToken: () => Promise<void>
}
