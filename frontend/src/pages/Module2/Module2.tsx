/**
 * Module 2 page (placeholder)
 * Basic layout placeholder for module 2
 */

import React from 'react'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import styles from './Module2.module.css'

const Module2: React.FC = () => {
  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>模块二功能</h1>
            <p className={styles.subtitle}>模块二功能描述占位符，此处填写具体功能说明</p>
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
          </div>
        </header>

        {/* Main content */}
        <div className={styles.content}>
          {/* Overview cards */}
          <div className={styles.overviewGrid}>
            <Card className={styles.overviewCard} variant="elevated">
              <div className={styles.overviewHeader}>
                <Icon name="database" size="lg" variant="primary" />
                <h3 className={styles.overviewTitle}>数据总览</h3>
              </div>
              <div className={styles.overviewContent}>
                <p className={styles.overviewText}>
                  模块二主要处理数据分析相关功能，提供数据可视化、统计分析和报告生成能力。
                </p>
                <div className={styles.overviewStats}>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>1,234</div>
                    <div className={styles.statLabel}>数据总量</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>89.5%</div>
                    <div className={styles.statLabel}>处理成功率</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className={styles.overviewCard} variant="elevated">
              <div className={styles.overviewHeader}>
                <Icon name="lineChart" size="lg" variant="success" />
                <h3 className={styles.overviewTitle}>分析功能</h3>
              </div>
              <div className={styles.overviewContent}>
                <p className={styles.overviewText}>
                  支持多种数据分析方法，包括趋势分析、对比分析、相关性分析等。
                </p>
                <div className={styles.featureList}>
                  <div className={styles.featureItem}>
                    <Icon name="check" size="sm" variant="success" />
                    <span>趋势分析</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Icon name="check" size="sm" variant="success" />
                    <span>对比分析</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Icon name="check" size="sm" variant="success" />
                    <span>相关性分析</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className={styles.overviewCard} variant="elevated">
              <div className={styles.overviewHeader}>
                <Icon name="setting" size="lg" variant="info" />
                <h3 className={styles.overviewTitle}>配置选项</h3>
              </div>
              <div className={styles.overviewContent}>
                <p className={styles.overviewText}>
                  可配置分析参数、输出格式、自动化处理规则等高级选项。
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Icon name="tool" />}
                  onClick={() => alert('配置面板待实现')}
                >
                  配置面板
                </Button>
              </div>
            </Card>
          </div>

          {/* Main action card */}
          <Card className={styles.mainCard} variant="elevated">
            <div className={styles.mainHeader}>
              <h2 className={styles.mainTitle}>主要功能区域</h2>
              <p className={styles.mainDescription}>
                此区域为模块二的主要功能操作界面，具体功能待实现。
              </p>
            </div>

            <div className={styles.mainContent}>
              <div className={styles.actionGrid}>
                <Button
                  variant="primary"
                  size="large"
                  leftIcon={<Icon name="play" />}
                  onClick={() => alert('开始分析功能待实现')}
                  fullWidth
                >
                  开始分析
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="upload" />}
                  onClick={() => alert('数据导入功能待实现')}
                  fullWidth
                >
                  导入数据
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  leftIcon={<Icon name="download" />}
                  onClick={() => alert('报告导出功能待实现')}
                  fullWidth
                >
                  导出报告
                </Button>
                <Button
                  variant="ghost"
                  size="large"
                  leftIcon={<Icon name="history" />}
                  onClick={() => alert('历史记录功能待实现')}
                  fullWidth
                >
                  查看历史
                </Button>
              </div>

              <div className={styles.placeholderSection}>
                <div className={styles.placeholderHeader}>
                  <Icon name="code" variant="secondary" />
                  <h4>功能预览区域</h4>
                </div>
                <div className={styles.placeholderContent}>
                  <p>模块二的具体功能界面将在此处显示。</p>
                  <p>包括数据输入、参数配置、结果展示等组件。</p>
                  <div className={styles.placeholderGrid}>
                    <div className={styles.placeholderItem}>图表展示区</div>
                    <div className={styles.placeholderItem}>数据分析区</div>
                    <div className={styles.placeholderItem}>结果输出区</div>
                    <div className={styles.placeholderItem}>参数设置区</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom cards */}
          <div className={styles.bottomGrid}>
            <Card className={styles.bottomCard} variant="outlined">
              <h3 className={styles.bottomTitle}>使用提示</h3>
              <ul className={styles.tipList}>
                <li>确保输入数据格式正确</li>
                <li>根据需求选择合适的分析方法</li>
                <li>定期保存分析结果</li>
                <li>查看历史记录学习最佳实践</li>
              </ul>
            </Card>

            <Card className={styles.bottomCard} variant="outlined">
              <h3 className={styles.bottomTitle}>近期活动</h3>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <Icon name="user" size="sm" />
                  <span>用户A 完成了数据分析任务</span>
                  <span className={styles.activityTime}>2小时前</span>
                </div>
                <div className={styles.activityItem}>
                  <Icon name="warning" size="sm" />
                  <span>系统自动处理了10条数据</span>
                  <span className={styles.activityTime}>昨天</span>
                </div>
                <div className={styles.activityItem}>
                  <Icon name="check" size="sm" />
                  <span>分析报告已生成并发送</span>
                  <span className={styles.activityTime}>3天前</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer note */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            <Icon name="info" size="sm" />
            <span>模块二功能正在开发中，预计下一个版本发布完整功能。</span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Module2
