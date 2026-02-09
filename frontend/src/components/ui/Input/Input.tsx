import React, { forwardRef } from 'react'
import classNames from 'classnames'
import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input size */
  size?: 'small' | 'medium' | 'large'
  /** Input variant */
  variant?: 'default' | 'filled' | 'borderless'
  /** Whether input has error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Success state */
  success?: boolean
  /** Success message */
  successMessage?: string
  /** Left icon or element */
  leftElement?: React.ReactNode
  /** Right icon or element */
  rightElement?: React.ReactNode
  /** Label text */
  label?: string
  /** Helper text */
  helperText?: string
  /** Whether input is required */
  required?: boolean
  /** Full width */
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'medium',
      variant = 'default',
      error = false,
      errorMessage,
      success = false,
      successMessage,
      leftElement,
      rightElement,
      label,
      helperText,
      required = false,
      fullWidth = false,
      className,
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const inputClasses = classNames(
      styles.input,
      styles[`size-${size}`],
      styles[`variant-${variant}`],
      {
        [styles.error]: error,
        [styles.success]: success,
        [styles.disabled]: disabled,
        [styles.withLeftElement]: leftElement,
        [styles.withRightElement]: rightElement,
        [styles.fullWidth]: fullWidth,
      },
      className
    )

    const containerClasses = classNames(styles.container, {
      [styles.fullWidth]: fullWidth,
    })

    const hasMessage = errorMessage || successMessage || helperText
    const messageType = errorMessage ? 'error' : successMessage ? 'success' : 'helper'

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.requiredIndicator}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {leftElement && <div className={styles.leftElement}>{leftElement}</div>}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={hasMessage ? `${inputId}-${messageType}-message` : undefined}
            {...rest}
          />

          {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
        </div>

        {hasMessage && (
          <div
            id={`${inputId}-${messageType}-message`}
            className={classNames(styles.message, styles[`message-${messageType}`])}
          >
            {errorMessage || successMessage || helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
