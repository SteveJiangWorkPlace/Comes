/**
 * Sidebar menu item component
 */

import React from 'react'
import classNames from 'classnames'
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

  // 获取标签首字符（用于折叠状态）
  const firstChar = item.label.charAt(0)

  return (
    <li className={itemClasses}>
      <button
        className={styles.menuButton}
        onClick={onClick}
        aria-label={item.label}
        title={item.label}
        aria-current={active ? 'page' : undefined}
      >
        {collapsed ? (
          // 折叠状态：显示首字符
          <div className={styles.collapsedLabel}>
            {firstChar}
            {showBadge && <span className={styles.badgeCollapsed}>!</span>}
          </div>
        ) : (
          // 展开状态：显示完整标签
          <div className={styles.menuContent}>
            <span className={styles.menuLabel}>{item.label}</span>
            {active && <div className={styles.activeIndicator} />}
            {showBadge && <span className={styles.badge}>新</span>}
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
