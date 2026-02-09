/**
 * Validation utilities for Comes application
 */

/**
 * Validates an email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a password
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Validates a username
 * - 3 to 20 characters
 * - Only letters, numbers, underscores, and hyphens
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Validates a URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates a phone number (basic international format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validates required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (value === null || value === undefined) {
    return false
  }
  return true
}

/**
 * Validates minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min
}

/**
 * Validates maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max
}

/**
 * Validates that two values match (for password confirmation)
 */
export const valuesMatch = (value1: any, value2: any): boolean => {
  return value1 === value2
}

/**
 * Validates a number range
 */
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Validates a credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/\D/g, '')

  // Check length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false
  }

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validates an expiration date (MM/YY format)
 */
export const isValidExpirationDate = (expiry: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
  if (!regex.test(expiry)) {
    return false
  }

  const [month, year] = expiry.split('/').map(Number)
  const _currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1

  // Convert 2-digit year to 4-digit
  const fullYear = 2000 + year

  // Check if date is in the future
  if (fullYear < new Date().getFullYear()) {
    return false
  }

  if (fullYear === new Date().getFullYear() && month < currentMonth) {
    return false
  }

  return true
}

/**
 * Validates a CSV string
 */
export const isValidCsv = (csv: string): boolean => {
  // Basic CSV validation - at least one comma and some content
  if (!csv.includes(',')) {
    return false
  }

  const lines = csv.split('\n')
  if (lines.length === 0) {
    return false
  }

  // Check that all lines have the same number of columns
  const firstLineColumns = lines[0].split(',').length
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].split(',').length !== firstLineColumns) {
      return false
    }
  }

  return true
}

/**
 * Validates a JSON string
 */
export const isValidJson = (json: string): boolean => {
  try {
    JSON.parse(json)
    return true
  } catch {
    return false
  }
}

/**
 * Creates a validation rule function
 */
export const createValidator = (rule: (value: any) => boolean, message: string) => {
  return (value: any): string | null => {
    return rule(value) ? null : message
  }
}

/**
 * Validates a form object against a set of rules
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, Array<(value: any) => string | null>>
): Record<keyof T, string[]> => {
  const errors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>

  for (const field in rules) {
    errors[field] = []
    const value = data[field]
    const fieldRules = rules[field]

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field].push(error)
      }
    }
  }

  return errors
}

/**
 * Checks if there are any validation errors
 */
export const hasErrors = (errors: Record<string, string[]>): boolean => {
  return Object.values(errors).some(fieldErrors => fieldErrors.length > 0)
}
