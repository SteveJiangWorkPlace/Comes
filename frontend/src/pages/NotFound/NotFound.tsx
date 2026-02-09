/**
 * 404 Not Found page
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import styles from './NotFound.module.css'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleContactSupport = () => {
    alert('联系支持功能待实现')
  }

  return (
    <AppLayout hideSidebar>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Error illustration */}
          <div className={styles.illustration}>
            <div className={styles.errorCode}>
              <span className={styles.codeDigit}>4</span>
              <div className={styles.codeIcon}>
                <Icon name="bug" size="xl" />
              </div>
              <span className={styles.codeDigit}>4</span>
            </div>
            <div className={styles.errorIllustration}>
              <div className={styles.illustrationCircle} />
              <div className={styles.illustrationLine1} />
              <div className={styles.illustrationLine2} />
              <div className={styles.illustrationLine3} />
            </div>
          </div>

          {/* Error message */}
          <Card className={styles.messageCard} variant="elevated">
            <div className={styles.messageHeader}>
              <h1 className={styles.title}>页面未找到</h1>
              <p className={styles.subtitle}>抱歉，您访问的页面不存在或已被移除</p>
            </div>

            <div className={styles.messageContent}>
              <div className={styles.errorDetails}>
                <div className={styles.detailItem}>
                  <Icon name="warning" variant="warning" />
                  <div className={styles.detailContent}>
                    <h4>可能的原因</h4>
                    <ul>
                      <li>页面地址输入错误</li>
                      <li>页面已被删除或移动</li>
                      <li>链接已过期</li>
                      <li>您没有访问权限</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Icon name="bulb" variant="info" />
                  <div className={styles.detailContent}>
                    <h4>建议操作</h4>
                    <ul>
                      <li>检查网址是否正确</li>
                      <li>返回上一页面</li>
                      <li>访问首页</li>
                      <li>联系技术支持</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className={styles.actionButtons}>
                <Button
                  variant="primary"
                  size="large"
                  leftIcon={<Icon name="home" />}
                  onClick={handleGoHome}
                  fullWidth
                >
                  返回首页
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="arrow-left" />}
                  onClick={handleGoBack}
                  fullWidth
                >
                  返回上一页
                </Button>
                <Button
                  variant="ghost"
                  size="large"
                  leftIcon={<Icon name="message" />}
                  onClick={handleContactSupport}
                  fullWidth
                >
                  联系支持
                </Button>
              </div>

              {/* Search box */}
              <div className={styles.searchSection}>
                <h4 className={styles.searchTitle}>搜索页面</h4>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="输入关键词搜索..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        alert('搜索功能待实现')
                      }
                    }}
                  />
                  <button className={styles.searchButton} onClick={() => alert('搜索功能待实现')}>
                    <Icon name="search" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className={styles.footerNote}>
              <p>
                <Icon name="info" size="sm" />
                <span>
                  如果您认为这是一个错误，请联系系统管理员或查看{' '}
                  <a href="#" className={styles.footerLink}>
                    帮助文档
                  </a>
                </span>
              </p>
            </div>
          </Card>

          {/* Quick links */}
          <div className={styles.quickLinks}>
            <h3 className={styles.quickLinksTitle}>常用页面</h3>
            <div className={styles.linksGrid}>
              <button className={styles.linkButton} onClick={() => navigate('/module1')}>
                <Icon name="dashboard" />
                <span>模块一</span>
              </button>
              <button className={styles.linkButton} onClick={() => navigate('/module2')}>
                <Icon name="barChart" />
                <span>模块二</span>
              </button>
              <button className={styles.linkButton} onClick={() => navigate('/module3')}>
                <Icon name="file" />
                <span>模块三</span>
              </button>
              <button className={styles.linkButton} onClick={() => navigate('/admin')}>
                <Icon name="setting" />
                <span>管理面板</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default NotFound
