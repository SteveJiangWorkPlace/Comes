/**
 * Module 3 page (placeholder)
 * Basic layout placeholder for module 3
 */

import React from 'react'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import styles from './Module3.module.css'

const Module3: React.FC = () => {
  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>文档中心</h1>
            <p className={styles.subtitle}>文档编辑、管理和协作功能</p>
          </div>
          <div className={styles.headerRight}>
            <Button
              variant="ghost"
              size="medium"
              leftIcon={<Icon name="info" />}
              onClick={() => alert('功能说明待实现')}
            >
              使用说明
            </Button>
            <Button
              variant="secondary"
              size="medium"
              leftIcon={<Icon name="plus" />}
              onClick={() => alert('创建新项目功能待实现')}
            >
              新建项目
            </Button>
          </div>
        </header>

        {/* Main content */}
        <div className={styles.content}>
          {/* Editor section */}
          <Card className={styles.editorCard} variant="elevated">
            <div className={styles.editorHeader}>
              <div className={styles.editorHeaderLeft}>
                <h2 className={styles.editorTitle}>文档编辑器</h2>
                <p className={styles.editorDescription}>
                  模块三提供文档编辑和管理功能，支持富文本编辑、版本控制和协作功能。
                </p>
              </div>
              <div className={styles.editorHeaderRight}>
                <div className={styles.editorStats}>
                  <div className={styles.editorStat}>
                    <Icon name="file" size="sm" />
                    <span>12 个文档</span>
                  </div>
                  <div className={styles.editorStat}>
                    <Icon name="user" size="sm" />
                    <span>3 人协作</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.editorContent}>
              <div className={styles.editorToolbar}>
                <div className={styles.toolbarGroup}>
                  <button className={styles.toolbarButton} title="加粗">
                    <Icon name="bold" />
                  </button>
                  <button className={styles.toolbarButton} title="斜体">
                    <Icon name="italic" />
                  </button>
                  <button className={styles.toolbarButton} title="下划线">
                    <Icon name="underline" />
                  </button>
                  <div className={styles.toolbarSeparator} />
                  <button className={styles.toolbarButton} title="列表">
                    <Icon name="unordered-list" />
                  </button>
                  <button className={styles.toolbarButton} title="编号列表">
                    <Icon name="ordered-list" />
                  </button>
                  <div className={styles.toolbarSeparator} />
                  <button className={styles.toolbarButton} title="链接">
                    <Icon name="link" />
                  </button>
                  <button className={styles.toolbarButton} title="图片">
                    <Icon name="picture" />
                  </button>
                </div>
                <div className={styles.toolbarGroup}>
                  <button className={styles.toolbarButton} title="保存">
                    <Icon name="save" />
                    <span>保存</span>
                  </button>
                  <button className={styles.toolbarButton} title="预览">
                    <Icon name="eye" />
                    <span>预览</span>
                  </button>
                  <button className={styles.toolbarButton} title="分享">
                    <Icon name="share" />
                    <span>分享</span>
                  </button>
                </div>
              </div>

              <div className={styles.editorArea}>
                <div className={styles.editorPlaceholder}>
                  <Icon name="edit" size="xl" variant="secondary" />
                  <h3>文档编辑区域</h3>
                  <p>在此处编写和编辑您的文档内容。</p>
                  <p>支持富文本格式、图片插入、表格创建等功能。</p>
                  <Button
                    variant="primary"
                    size="medium"
                    leftIcon={<Icon name="file" />}
                    onClick={() => alert('创建新文档功能待实现')}
                    className={styles.editorActionButton}
                  >
                    开始编写
                  </Button>
                </div>
              </div>

              <div className={styles.editorStatus}>
                <div className={styles.statusItem}>
                  <Icon name="check" size="sm" variant="success" />
                  <span>自动保存已启用</span>
                </div>
                <div className={styles.statusItem}>
                  <Icon name="user" size="sm" />
                  <span>在线用户: 3人</span>
                </div>
                <div className={styles.statusItem}>
                  <Icon name="history" size="sm" />
                  <span>最后保存: 刚刚</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sidebar cards */}
          <div className={styles.sidebar}>
            {/* Documents card */}
            <Card className={styles.sidebarCard} variant="outlined">
              <div className={styles.sidebarCardHeader}>
                <h3 className={styles.sidebarCardTitle}>
                  <Icon name="folder" />
                  <span>最近文档</span>
                </h3>
                <Button variant="ghost" size="small" onClick={() => alert('查看所有文档')}>
                  查看全部
                </Button>
              </div>

              <div className={styles.documentList}>
                {[
                  { title: '项目计划书', modified: '今天', type: 'doc' },
                  { title: '会议纪要', modified: '昨天', type: 'note' },
                  { title: '技术文档', modified: '3天前', type: 'doc' },
                  { title: '需求分析', modified: '1周前', type: 'report' },
                  { title: '用户反馈', modified: '2周前', type: 'form' },
                ].map((doc, index) => (
                  <div key={index} className={styles.documentItem}>
                    <div className={styles.documentIcon}>
                      <Icon
                        name={
                          doc.type === 'doc' ? 'file' : doc.type === 'note' ? 'edit' : 'barChart'
                        }
                      />
                    </div>
                    <div className={styles.documentInfo}>
                      <div className={styles.documentTitle}>{doc.title}</div>
                      <div className={styles.documentMeta}>
                        <span className={styles.documentType}>
                          {doc.type === 'doc' ? '文档' : doc.type === 'note' ? '笔记' : '报告'}
                        </span>
                        <span className={styles.documentModified}>{doc.modified}修改</span>
                      </div>
                    </div>
                    <button className={styles.documentAction} title="更多操作">
                      <Icon name="more" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Collaboration card */}
            <Card className={styles.sidebarCard} variant="outlined">
              <div className={styles.sidebarCardHeader}>
                <h3 className={styles.sidebarCardTitle}>
                  <Icon name="team" />
                  <span>协作成员</span>
                </h3>
                <Button variant="ghost" size="small" onClick={() => alert('邀请成员')}>
                  邀请
                </Button>
              </div>

              <div className={styles.collaboratorList}>
                {[
                  { name: '张三', role: '所有者', avatar: 'Z' },
                  { name: '李四', role: '编辑', avatar: 'L' },
                  { name: '王五', role: '查看者', avatar: 'W' },
                  { name: '赵六', role: '编辑', avatar: 'Z' },
                ].map((user, index) => (
                  <div key={index} className={styles.collaboratorItem}>
                    <div className={styles.collaboratorAvatar}>{user.avatar}</div>
                    <div className={styles.collaboratorInfo}>
                      <div className={styles.collaboratorName}>{user.name}</div>
                      <div className={styles.collaboratorRole}>{user.role}</div>
                    </div>
                    <div className={styles.collaboratorStatus} />
                  </div>
                ))}
              </div>

              <div className={styles.collaborationActions}>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="message" />}
                  onClick={() => alert('开始聊天')}
                  fullWidth
                >
                  发起聊天
                </Button>
              </div>
            </Card>

            {/* Quick actions card */}
            <Card className={styles.sidebarCard} variant="filled">
              <h3 className={styles.sidebarCardTitle}>快捷操作</h3>
              <div className={styles.quickActions}>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="download" />}
                  onClick={() => alert('导出文档')}
                  fullWidth
                >
                  导出文档
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="print" />}
                  onClick={() => alert('打印文档')}
                  fullWidth
                >
                  打印
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="tag" />}
                  onClick={() => alert('添加标签')}
                  fullWidth
                >
                  添加标签
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="lock" />}
                  onClick={() => alert('权限设置')}
                  fullWidth
                >
                  权限设置
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Activity feed */}
        <Card className={styles.activityCard} variant="elevated">
          <h3 className={styles.activityTitle}>近期活动</h3>
          <div className={styles.activityFeed}>
            {[
              {
                action: '创建了文档',
                target: '项目计划书',
                user: '张三',
                time: '10分钟前',
                icon: 'plus',
              },
              { action: '修改了', target: '会议纪要', user: '李四', time: '1小时前', icon: 'edit' },
              {
                action: '评论了',
                target: '技术文档',
                user: '王五',
                time: '2小时前',
                icon: 'message',
              },
              { action: '分享了', target: '需求分析', user: '赵六', time: '昨天', icon: 'share' },
              {
                action: '完成了',
                target: '用户反馈收集',
                user: '张三',
                time: '2天前',
                icon: 'check',
              },
            ].map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <Icon name={activity.icon as any} />
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <span className={styles.activityUser}>{activity.user}</span>
                    <span>{activity.action}</span>
                    <span className={styles.activityTarget}>{activity.target}</span>
                  </div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer note */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            <Icon name="info" size="sm" />
            <span>模块三功能正在开发中，协作编辑和版本控制功能即将推出。</span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Module3
