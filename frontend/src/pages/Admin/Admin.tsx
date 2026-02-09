/**
 * Admin page (placeholder)
 * Admin dashboard with management features
 */

import React from 'react'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import styles from './Admin.module.css'

const Admin: React.FC = () => {
  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>管理员面板</h1>
            <p className={styles.subtitle}>系统管理和监控面板，仅管理员可访问</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.adminBadge}>
              <Icon name="crown" />
              <span>管理员</span>
            </div>
            <Button
              variant="secondary"
              size="medium"
              leftIcon={<Icon name="reload" />}
              onClick={() => alert('刷新数据')}
            >
              刷新
            </Button>
          </div>
        </header>

        {/* Stats overview */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard} variant="elevated">
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Icon name="user" size="lg" variant="primary" />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>1,234</div>
                <div className={styles.statLabel}>总用户数</div>
              </div>
            </div>
            <div className={styles.statTrend}>
              <Icon name="arrow-up" size="sm" variant="success" />
              <span className={styles.trendText}>+12% 本周</span>
            </div>
          </Card>

          <Card className={styles.statCard} variant="elevated">
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Icon name="activity" size="lg" variant="success" />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>89.7%</div>
                <div className={styles.statLabel}>系统可用性</div>
              </div>
            </div>
            <div className={styles.statTrend}>
              <Icon name="check" size="sm" variant="success" />
              <span className={styles.trendText}>运行正常</span>
            </div>
          </Card>

          <Card className={styles.statCard} variant="elevated">
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Icon name="database" size="lg" variant="info" />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>3.2TB</div>
                <div className={styles.statLabel}>存储使用</div>
              </div>
            </div>
            <div className={styles.statTrend}>
              <Icon name="warning" size="sm" variant="warning" />
              <span className={styles.trendText}>75% 已使用</span>
            </div>
          </Card>

          <Card className={styles.statCard} variant="elevated">
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Icon name="barChart" size="lg" variant="warning" />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>45,678</div>
                <div className={styles.statLabel}>今日请求</div>
              </div>
            </div>
            <div className={styles.statTrend}>
              <Icon name="arrow-up" size="sm" variant="success" />
              <span className={styles.trendText}>+8% 昨日</span>
            </div>
          </Card>
        </div>

        {/* Main content - two columns */}
        <div className={styles.content}>
          {/* Left column - Management tools */}
          <div className={styles.leftColumn}>
            <Card className={styles.toolsCard} variant="elevated">
              <h2 className={styles.sectionTitle}>管理工具</h2>
              <p className={styles.sectionDescription}>系统管理工具和配置选项</p>

              <div className={styles.toolsGrid}>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="user" />}
                  onClick={() => alert('用户管理')}
                  fullWidth
                >
                  用户管理
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="setting" />}
                  onClick={() => alert('系统设置')}
                  fullWidth
                >
                  系统设置
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="database" />}
                  onClick={() => alert('数据管理')}
                  fullWidth
                >
                  数据管理
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="safety" />}
                  onClick={() => alert('安全设置')}
                  fullWidth
                >
                  安全设置
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="bell" />}
                  onClick={() => alert('通知管理')}
                  fullWidth
                >
                  通知管理
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="audit" />}
                  onClick={() => alert('审计日志')}
                  fullWidth
                >
                  审计日志
                </Button>
              </div>
            </Card>

            {/* Recent activities */}
            <Card className={styles.activityCard} variant="outlined">
              <div className={styles.activityHeader}>
                <h3 className={styles.activityTitle}>最近管理活动</h3>
                <Button variant="ghost" size="small" onClick={() => alert('查看全部')}>
                  查看全部
                </Button>
              </div>

              <div className={styles.activityList}>
                {[
                  { action: '修改了系统配置', user: '管理员', time: '10分钟前', type: 'config' },
                  { action: '添加了新用户', user: '管理员', time: '1小时前', type: 'user' },
                  { action: '更新了权限设置', user: '管理员', time: '2小时前', type: 'security' },
                  { action: '备份了数据库', user: '系统', time: '昨天', type: 'backup' },
                  { action: '清理了日志文件', user: '系统', time: '2天前', type: 'maintenance' },
                ].map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <Icon
                        name={
                          activity.type === 'config'
                            ? 'setting'
                            : activity.type === 'user'
                              ? 'user'
                              : activity.type === 'security'
                                ? 'safety'
                                : activity.type === 'backup'
                                  ? 'database'
                                  : 'tool'
                        }
                        variant={
                          activity.type === 'config'
                            ? 'primary'
                            : activity.type === 'user'
                              ? 'success'
                              : activity.type === 'security'
                                ? 'warning'
                                : activity.type === 'backup'
                                  ? 'info'
                                  : 'secondary'
                        }
                      />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        <span className={styles.activityAction}>{activity.action}</span>
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityUser}>{activity.user}</span>
                        <span className={styles.activityTime}>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column - System info */}
          <div className={styles.rightColumn}>
            <Card className={styles.systemCard} variant="elevated">
              <h2 className={styles.sectionTitle}>系统信息</h2>

              <div className={styles.systemInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>系统版本</span>
                  <span className={styles.infoValue}>Comes v1.0.0</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>运行时间</span>
                  <span className={styles.infoValue}>15天 2小时</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>服务器状态</span>
                  <span className={styles.infoValue}>
                    <span className={styles.statusBadge + ' ' + styles.statusGood}>正常</span>
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>最后备份</span>
                  <span className={styles.infoValue}>2026-02-07 23:00</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>安全等级</span>
                  <span className={styles.infoValue}>
                    <span className={styles.statusBadge + ' ' + styles.statusWarning}>中等</span>
                  </span>
                </div>
              </div>

              <div className={styles.systemActions}>
                <Button
                  variant="primary"
                  size="medium"
                  leftIcon={<Icon name="cloud" />}
                  onClick={() => alert('执行备份')}
                  fullWidth
                >
                  立即备份
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<Icon name="tool" />}
                  onClick={() => alert('系统维护')}
                  fullWidth
                >
                  系统维护
                </Button>
              </div>
            </Card>

            {/* Quick actions */}
            <Card className={styles.quickCard} variant="filled">
              <h3 className={styles.quickTitle}>快捷操作</h3>

              <div className={styles.quickActions}>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="plus" />}
                  onClick={() => alert('添加管理员')}
                  fullWidth
                >
                  添加管理员
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="download" />}
                  onClick={() => alert('导出日志')}
                  fullWidth
                >
                  导出日志
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="notification" />}
                  onClick={() => alert('发送公告')}
                  fullWidth
                >
                  发送公告
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="monitor" />}
                  onClick={() => alert('监控面板')}
                  fullWidth
                >
                  监控面板
                </Button>
              </div>
            </Card>

            {/* Alerts */}
            <Card className={styles.alertCard} variant="outlined">
              <div className={styles.alertHeader}>
                <h3 className={styles.alertTitle}>
                  <Icon name="warning" variant="warning" />
                  <span>系统提醒</span>
                </h3>
                <span className={styles.alertCount}>2</span>
              </div>

              <div className={styles.alertList}>
                <div className={styles.alertItem + ' ' + styles.alertWarning}>
                  <div className={styles.alertIcon}>
                    <Icon name="database" />
                  </div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertMessage}>存储空间使用率超过75%</div>
                    <div className={styles.alertTime}>建议清理</div>
                  </div>
                </div>
                <div className={styles.alertItem + ' ' + styles.alertInfo}>
                  <div className={styles.alertIcon}>
                    <Icon name="calendar" />
                  </div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertMessage}>系统备份计划今晚执行</div>
                    <div className={styles.alertTime}>23:00-02:00</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer note */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            <Icon name="info" size="sm" />
            <span>管理员面板提供系统级管理功能，请谨慎操作。</span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Admin
