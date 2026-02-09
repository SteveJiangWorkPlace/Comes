import React from 'react'
import classNames from 'classnames'
import styles from './Button.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  /** Button size */
  size?: 'small' | 'medium' | 'large'
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Full width */
  fullWidth?: boolean
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
  /** Button content */
  children?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick,
  type = 'button',
  ...rest
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    {
      [styles.loading]: loading,
      [styles.disabled]: disabled,
      [styles.fullWidth]: fullWidth,
    },
    className
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner}>
          <div className={styles.spinnerDot} />
        </span>
      )}
      {leftIcon && !loading && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {rightIcon && !loading && <span className={styles.rightIcon}>{rightIcon}</span>}
    </button>
  )
}

export default Button
