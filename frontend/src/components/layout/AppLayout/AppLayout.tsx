/**
 * Main application layout component
 * Wraps the entire app with sidebar and content area
 */

import React, { useState } from 'react'
import classNames from 'classnames'
import Sidebar from '../Sidebar/Sidebar'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: React.ReactNode
  /** Whether sidebar is initially collapsed */
  defaultCollapsed?: boolean
  /** Hide sidebar completely */
  hideSidebar?: boolean
  /** Custom sidebar width */
  sidebarWidth?: number
  /** Custom collapsed sidebar width */
  collapsedWidth?: number
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  defaultCollapsed = false,
  hideSidebar = false,
  sidebarWidth = 240,
  collapsedWidth = 64,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed)

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const containerClasses = classNames(styles.container, {
    [styles.sidebarHidden]: hideSidebar,
  })

  const sidebarClasses = classNames(styles.sidebar, {
    [styles.collapsed]: sidebarCollapsed,
  })

  const contentClasses = classNames(styles.content, {
    [styles.expanded]: hideSidebar || sidebarCollapsed,
  })

  const sidebarStyle = {
    width: sidebarCollapsed ? collapsedWidth : sidebarWidth,
  }

  const contentStyle = {
    marginLeft: hideSidebar ? 0 : sidebarCollapsed ? collapsedWidth : sidebarWidth,
  }

  return (
    <div className={containerClasses}>
      {!hideSidebar && (
        <div className={sidebarClasses} style={sidebarStyle}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
            width={sidebarWidth}
            collapsedWidth={collapsedWidth}
          />
        </div>
      )}

      <main className={contentClasses} style={contentStyle}>
        {children}
      </main>

      {/* Sidebar toggle overlay for mobile */}
      {!hideSidebar && sidebarCollapsed && (
        <div
          className={styles.sidebarToggleOverlay}
          onClick={handleToggleSidebar}
          title="展开侧边栏"
        />
      )}
    </div>
  )
}

export default AppLayout
