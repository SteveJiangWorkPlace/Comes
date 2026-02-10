/**
 * TypeScript type definitions index
 */

// Re-export API types
export type {
  ApiResponse,
  ApiError,
  ValidationError,
  PaginationParams,
  LoginCredentials,
  AuthResponse,
  User,
  ApiKeys,
  Module1Data as ApiModule1Data,
  Module2Data as ApiModule2Data,
  Module3Data as ApiModule3Data,
  TodoResponse,
} from '../api/types'

// Export authentication types
export type {
  AuthState,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  ForgotPasswordFormData,
  ProfileUpdateFormData,
  AuthContextType,
} from './auth.types'

// Export module types
export type {
  BaseModuleState,
  Module1State,
  Module2State,
  Module3State,
  Module1Data,
  Module2Data,
  Module3Data,
  ModuleProcessRequest,
  ModuleProcessResponse,
  ModuleHistoryItem,
  ModuleConfig,
} from './module.types'

// Export transcript verification types
export type {
  CourseType,
  CourseTypeInfo,
  CourseInfo,
  Semester,
  TranscriptVerificationResult,
  TranscriptVerificationRequest,
  TranscriptVerificationResponse,
  CourseTypeMapping,
  TranscriptVerificationHistory,
} from './transcript.types'

// Export utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Route types
export interface RouteConfig {
  path: string
  component: React.ComponentType<any>
  exact?: boolean
  requiresAuth?: boolean
  requiresAdmin?: boolean
  layout?: React.ComponentType<any>
  title?: string
  icon?: string
}

// Props types for common components
export interface BaseProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps extends BaseProps {
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'small' | 'medium' | 'large'
}

// Theme types
export interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    // ... other color values
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      // ... other sizes
    }
    // ... other typography values
  }
  spacing: {
    unit: number
    // ... other spacing values
  }
}
