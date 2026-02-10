/**
 * Sidebar component
 * Main navigation sidebar with user info and menu items
 */

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { useAuth } from '../../../hooks/useAuth'
import { useApiKeys } from '../../../hooks/useApiKeys'
import SidebarItem from './SidebarItem'
import Icon from '../../ui/Icon/Icon'
import styles from './Sidebar.module.css'

interface SidebarProps {
  /** Whether sidebar is collapsed */
  collapsed: boolean
  /** Toggle callback */
  onToggle: () => void
  /** Sidebar width */
  width?: number
  /** Collapsed sidebar width */
  collapsedWidth?: number
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  width = 240,
  collapsedWidth = 64,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAdmin: _isAdmin } = useAuth()
  const { hasRequiredApiKeys: _hasRequiredApiKeys, getMissingApiKeys } = useApiKeys()
  const [activeKey, setActiveKey] = useState<string>('')
  const [showApiKeysModal, setShowApiKeysModal] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Menu items configuration
  const menuItems = useMemo(
    () => [
      {
        key: 'module1',
        label: '模块一',
        icon: 'dashboard',
        path: '/module1',
        role: ['user', 'admin'],
      },
      {
        key: 'module2',
        label: '模块二',
        icon: 'barChart',
        path: '/module2',
        role: ['user', 'admin'],
      },
      {
        key: 'module3',
        label: '模块三',
        icon: 'file',
        path: '/module3',
        role: ['user', 'admin'],
      },
      {
        key: 'admin',
        label: '管理员',
        icon: 'setting',
        path: '/admin',
        role: ['admin'],
        showBadge: true,
      },
    ],
    []
  )

  // Update active key based on current route
  useLayoutEffect(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path))
    setActiveKey(currentItem?.key || '')
  }, [location.pathname])

  // Handle menu item click
  const handleMenuClick = (key: string, path: string) => {
    setActiveKey(key)
    navigate(path)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Handle API keys management
  const handleApiKeysClick = () => {
    setShowApiKeysModal(true)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sidebarRef.current || !sidebarRef.current.contains(document.activeElement)) {
        return
      }

      const items = menuItems.filter(item => {
        if (item.role && user?.role) {
          return item.role.includes(user.role)
        }
        return true
      })

      const currentIndex = items.findIndex(item => item.key === activeKey)

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex > 0) {
            const prevItem = items[currentIndex - 1]
            setActiveKey(prevItem.key)
            navigate(prevItem.path)
          }
          break

        case 'ArrowDown':
          e.preventDefault()
          if (currentIndex < items.length - 1) {
            const nextItem = items[currentIndex + 1]
            setActiveKey(nextItem.key)
            navigate(nextItem.path)
          }
          break

        case 'Enter':
          e.preventDefault()
          const activeItem = items.find(item => item.key === activeKey)
          if (activeItem) {
            navigate(activeItem.path)
          }
          break

        case 'Escape':
          if (showApiKeysModal) {
            setShowApiKeysModal(false)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeKey, user, showApiKeysModal, navigate])

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.role || !user?.role) return true
    return item.role.includes(user.role)
  })

  // Check if API keys are configured
  const hasMissingApiKeys = getMissingApiKeys().length > 0

  const sidebarClasses = classNames(styles.sidebar, {
    [styles.collapsed]: collapsed,
  })

  return (
    <div
      ref={sidebarRef}
      className={sidebarClasses}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      {/* Sidebar header with logo and toggle */}
      <div className={styles.header}>
        {!collapsed ? (
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <img src="/logopic.svg" alt="Comes Logo" className={styles.logoImage} />
              <span className={styles.logoText}>Comes</span>
            </div>
          </div>
        ) : (
          <div className={styles.logoCollapsed}>
            <img src="/logopic.svg" alt="Comes Logo" className={styles.logoImageCollapsed} />
          </div>
        )}

        <button
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          <Icon name={collapsed ? 'menuUnfold' : 'menuFold'} />
        </button>
      </div>

      {/* User info section */}
      {!collapsed && user && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.fullName || user.username}</div>
            <div className={styles.userRole}>{user.role === 'admin' ? '管理员' : '用户'}</div>
          </div>
        </div>
      )}


      {/* Navigation menu */}
      <nav className={styles.nav} role="navigation" aria-label="主菜单">
        <ul className={styles.menuList}>
          {filteredMenuItems.map(item => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
              collapsed={collapsed}
              onClick={() => handleMenuClick(item.key, item.path)}
              showBadge={item.showBadge}
            />
          ))}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className={styles.footer}>
        {!collapsed ? (
          <>
            <button
              className={classNames(styles.footerButton, {
                [styles.hasWarning]: hasMissingApiKeys,
              })}
              onClick={handleApiKeysClick}
              title={hasMissingApiKeys ? '缺少必要的API密钥' : '管理API密钥'}
            >
              <Icon name="key" />
              <span>API密钥</span>
              {hasMissingApiKeys && <span className={styles.warningBadge}>!</span>}
            </button>

            <button className={styles.footerButton} onClick={handleLogout} title="退出登录">
              <Icon name="logout" />
              <span>退出</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={classNames(styles.footerButton, styles.collapsedButton, {
                [styles.hasWarning]: hasMissingApiKeys,
              })}
              onClick={handleApiKeysClick}
              title={hasMissingApiKeys ? '缺少必要的API密钥' : '管理API密钥'}
            >
              <Icon name="key" />
              {hasMissingApiKeys && <span className={styles.warningBadgeCollapsed}>!</span>}
            </button>

            <button
              className={classNames(styles.footerButton, styles.collapsedButton)}
              onClick={handleLogout}
              title="退出登录"
            >
              <Icon name="logout" />
            </button>
          </>
        )}
      </div>

      {/* API Keys Modal (placeholder) */}
      {showApiKeysModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApiKeysModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>API密钥管理</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowApiKeysModal(false)}
                aria-label="关闭"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>API密钥管理功能待实现。</p>
              <p>在此处配置外部服务的API密钥。</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButton} onClick={() => setShowApiKeysModal(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
