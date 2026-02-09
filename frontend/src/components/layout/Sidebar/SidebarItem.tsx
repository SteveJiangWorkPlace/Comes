/**
 * Sidebar menu item component
 */

import React from 'react'
import classNames from 'classnames'
import Icon from '../../ui/Icon/Icon'
import styles from './Sidebar.module.css'

interface SidebarItemProps {
  item: {
    key: string
    label: string
    icon: string
    path: string
    role?: string[]
    showBadge?: boolean
  }
  active: boolean
  collapsed: boolean
  onClick: () => void
  showBadge?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  active,
  collapsed,
  onClick,
  showBadge = false,
}) => {
  const itemClasses = classNames(styles.menuItem, {
    [styles.active]: active,
    [styles.collapsed]: collapsed,
  })

  const iconVariant = active ? 'primary' : 'default'

  return (
    <li className={itemClasses}>
      <button
        className={styles.menuButton}
        onClick={onClick}
        aria-label={item.label}
        title={item.label}
        aria-current={active ? 'page' : undefined}
      >
        <div className={styles.menuIcon}>
          <Icon name={item.icon as any} variant={iconVariant} />
          {showBadge && !collapsed && <span className={styles.badge}>新</span>}
          {showBadge && collapsed && <span className={styles.badgeCollapsed}>!</span>}
        </div>

        {!collapsed && (
          <div className={styles.menuContent}>
            <span className={styles.menuLabel}>{item.label}</span>
            {active && <div className={styles.activeIndicator} />}
          </div>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className={styles.tooltip}>
          {item.label}
          {showBadge && <span className={styles.tooltipBadge}>新</span>}
        </div>
      )}
    </li>
  )
}

export default SidebarItem
