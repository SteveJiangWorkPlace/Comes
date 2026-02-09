import React from 'react'
import classNames from 'classnames'
import styles from './Card.module.css'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'elevated' | 'outlined' | 'filled'
  /** Card padding */
  padding?: 'none' | 'small' | 'medium' | 'large'
  /** Whether card is hoverable */
  hoverable?: boolean
  /** Whether card is selectable */
  selectable?: boolean
  /** Whether card is selected */
  selected?: boolean
  /** Card title */
  title?: React.ReactNode
  /** Card subtitle */
  subtitle?: React.ReactNode
  /** Card actions (buttons, icons, etc.) */
  actions?: React.ReactNode[]
  /** Card cover image */
  cover?: React.ReactNode
  /** Card footer */
  footer?: React.ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Card content */
  children?: React.ReactNode
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  hoverable = false,
  selectable = false,
  selected = false,
  title,
  subtitle,
  actions,
  cover,
  footer,
  fullWidth = false,
  children,
  className,
  ...rest
}) => {
  const cardClasses = classNames(
    styles.card,
    styles[`variant-${variant}`],
    styles[`padding-${padding}`],
    {
      [styles.hoverable]: hoverable,
      [styles.selectable]: selectable,
      [styles.selected]: selected,
      [styles.fullWidth]: fullWidth,
    },
    className
  )

  const hasHeader = title || subtitle || actions
  const hasFooter = footer

  return (
    <div className={cardClasses} {...rest}>
      {cover && <div className={styles.cover}>{cover}</div>}

      {hasHeader && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {title && <div className={styles.title}>{title}</div>}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          {actions && actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((action, index) => (
                <div key={index} className={styles.actionItem}>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {children && <div className={styles.content}>{children}</div>}

      {hasFooter && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

export default Card
