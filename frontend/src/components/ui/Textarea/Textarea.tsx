import React, { forwardRef, useState } from 'react'
import classNames from 'classnames'
import styles from './Textarea.module.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea size */
  size?: 'small' | 'medium' | 'large'
  /** Textarea variant */
  variant?: 'default' | 'filled' | 'borderless'
  /** Whether textarea has error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Success state */
  success?: boolean
  /** Success message */
  successMessage?: string
  /** Label text */
  label?: string
  /** Helper text */
  helperText?: string
  /** Whether textarea is required */
  required?: boolean
  /** Full width */
  fullWidth?: boolean
  /** Show character count */
  showCount?: boolean
  /** Maximum character count */
  maxLength?: number
  /** Auto resize based on content */
  autoResize?: boolean
  /** Minimum rows */
  minRows?: number
  /** Maximum rows */
  maxRows?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'medium',
      variant = 'default',
      error = false,
      errorMessage,
      success = false,
      successMessage,
      label,
      helperText,
      required = false,
      fullWidth = false,
      showCount = false,
      maxLength,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      className,
      id,
      value,
      defaultValue,
      onChange,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      typeof value === 'string' ? value : (defaultValue as string) || ''
    )

    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const characterCount = internalValue.length
    const hasMaxLength = maxLength !== undefined
    const isNearLimit = hasMaxLength && characterCount > maxLength * 0.9
    const isOverLimit = hasMaxLength && characterCount > maxLength

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value

      if (hasMaxLength && newValue.length > maxLength) {
        return
      }

      setInternalValue(newValue)
      onChange?.(e)
    }

    const textareaClasses = classNames(
      styles.textarea,
      styles[`size-${size}`],
      styles[`variant-${variant}`],
      {
        [styles.error]: error,
        [styles.success]: success,
        [styles.disabled]: disabled,
        [styles.fullWidth]: fullWidth,
        [styles.autoResize]: autoResize,
      },
      className
    )

    const containerClasses = classNames(styles.container, {
      [styles.fullWidth]: fullWidth,
    })

    const hasMessage = errorMessage || successMessage || helperText
    const messageType = errorMessage ? 'error' : successMessage ? 'success' : 'helper'

    const characterCountClasses = classNames(styles.characterCount, {
      [styles.nearLimit]: isNearLimit && !isOverLimit,
      [styles.overLimit]: isOverLimit,
    })

    // Calculate rows for auto resize
    const rows = autoResize
      ? Math.min(Math.max(minRows, internalValue.split('\n').length + 1), maxRows)
      : minRows

    return (
      <div className={containerClasses}>
        {label && (
          <div className={styles.labelRow}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
              {required && <span className={styles.requiredIndicator}>*</span>}
            </label>
            {showCount && hasMaxLength && (
              <div className={characterCountClasses}>
                {characterCount}/{maxLength}
              </div>
            )}
          </div>
        )}

        <div className={styles.textareaWrapper}>
          <textarea
            ref={ref}
            id={inputId}
            className={textareaClasses}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={hasMessage ? `${inputId}-${messageType}-message` : undefined}
            rows={rows}
            maxLength={maxLength}
            {...rest}
          />
        </div>

        {hasMessage && (
          <div
            id={`${inputId}-${messageType}-message`}
            className={classNames(styles.message, styles[`message-${messageType}`])}
          >
            {errorMessage || successMessage || helperText}
          </div>
        )}

        {!label && showCount && hasMaxLength && (
          <div className={styles.characterCountRow}>
            <div className={characterCountClasses}>
              {characterCount}/{maxLength}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
