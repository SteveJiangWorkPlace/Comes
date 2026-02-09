/**
 * Module 1 page (placeholder)
 * Basic layout placeholder with card design
 */

import React, { useEffect } from 'react'
import classNames from 'classnames'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Input from '../../components/ui/Input/Input'
import Textarea from '../../components/ui/Textarea/Textarea'
import Icon from '../../components/ui/Icon/Icon'
import { useModule1Store } from '../../store/module1.store'
import styles from './Module1.module.css'

const Module1: React.FC = () => {
  const {
    // State
    data,
    currentData,
    isLoading,
    error,
    inputText,
    selectedOption,
    showAdvanced,
    page,
    total,
    hasMore,

    // Actions
    setInputText,
    setSelectedOption,
    toggleAdvanced,
    fetchData,
    submitData,
    deleteData,
    resetFilters,
    setLoading,
    setError,
  } = useModule1Store()

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Handle form submission
  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('请输入内容')
      return
    }

    try {
      await submitData(inputText)
    } catch (err) {
      console.error('Submit error:', err)
    }
  }

  // Handle clear input
  const handleClear = () => {
    setInputText('')
    setError(null)
  }

  // Handle copy result
  const handleCopyResult = () => {
    if (currentData?.output) {
      navigator.clipboard
        .writeText(currentData.output)
        .then(() => alert('已复制到剪贴板'))
        .catch(err => console.error('Copy failed:', err))
    }
  }

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchData()
    }
  }

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('确定要删除此项吗？')) {
      try {
        await deleteData(id)
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>模块一功能</h1>
            <p className={styles.subtitle}>模块一功能描述占位符，此处填写具体功能说明</p>
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
              leftIcon={<Icon name="setting" />}
              onClick={toggleAdvanced}
            >
              {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
            </Button>
          </div>
        </header>

        {/* Main content - two column layout */}
        <div className={styles.content}>
          {/* Left column - Input and controls */}
          <div className={styles.leftColumn}>
            <Card className={styles.inputCard} variant="elevated">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Icon name="edit" />
                  <span>输入区域</span>
                </h3>
                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setInputText('示例输入文本，用于演示功能')}
                  >
                    填充示例
                  </Button>
                  <Button variant="ghost" size="small" onClick={handleClear}>
                    清空
                  </Button>
                </div>
              </div>

              <div className={styles.inputSection}>
                <Textarea
                  label="输入内容"
                  placeholder="请输入要处理的内容..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  size="medium"
                  variant="filled"
                  fullWidth
                  showCount
                  maxLength={1000}
                  minRows={6}
                  autoResize
                  helperText="支持最多1000个字符的文本输入"
                />

                {showAdvanced && (
                  <div className={styles.advancedSection}>
                    <div className={styles.advancedHeader}>
                      <Icon name="tool" size="sm" />
                      <span>高级选项</span>
                    </div>
                    <div className={styles.advancedOptions}>
                      <div className={styles.optionGroup}>
                        <label className={styles.optionLabel}>处理模式</label>
                        <div className={styles.optionButtons}>
                          {['模式A', '模式B', '模式C', '自定义'].map(option => (
                            <button
                              key={option}
                              className={classNames(styles.optionButton, {
                                [styles.active]: selectedOption === option,
                              })}
                              onClick={() => setSelectedOption(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.optionGroup}>
                        <label className={styles.optionLabel}>参数设置</label>
                        <div className={styles.parameterInputs}>
                          <Input
                            label="参数一"
                            placeholder="0-100"
                            type="number"
                            size="small"
                            fullWidth
                          />
                          <Input label="参数二" placeholder="可选值" size="small" fullWidth />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.actionButtons}>
                  <Button
                    variant="primary"
                    size="large"
                    loading={isLoading}
                    onClick={handleSubmit}
                    disabled={!inputText.trim()}
                    leftIcon={<Icon name="rocket" />}
                    fullWidth
                  >
                    {isLoading ? '处理中...' : '开始处理'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stats card */}
            <Card className={styles.statsCard} variant="outlined">
              <div className={styles.statsHeader}>
                <h4 className={styles.statsTitle}>统计信息</h4>
                <Icon name="barChart" variant="primary" />
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>总处理次数</div>
                  <div className={styles.statValue}>{total}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>今日处理</div>
                  <div className={styles.statValue}>12</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>成功率</div>
                  <div className={styles.statValue}>98.5%</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>平均耗时</div>
                  <div className={styles.statValue}>1.2s</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column - Results and history */}
          <div className={styles.rightColumn}>
            {/* Current result card */}
            <Card className={styles.resultCard} variant="elevated">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Icon name="check" variant="success" />
                  <span>处理结果</span>
                </h3>
                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleCopyResult}
                    disabled={!currentData}
                    leftIcon={<Icon name="copy" />}
                  >
                    复制结果
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => alert('导出功能待实现')}
                    leftIcon={<Icon name="download" />}
                  >
                    导出
                  </Button>
                </div>
              </div>

              <div className={styles.resultContent}>
                {currentData ? (
                  <div className={styles.resultDisplay}>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultTime}>
                        {new Date(currentData.timestamp).toLocaleString('zh-CN')}
                      </span>
                      <span
                        className={classNames(
                          styles.resultStatus,
                          styles[`status-${currentData.status}`]
                        )}
                      >
                        {currentData.status === 'success' ? '成功' : '处理中'}
                      </span>
                    </div>
                    <div className={styles.resultOutput}>
                      <pre>{currentData.output}</pre>
                    </div>
                    {currentData.metadata && (
                      <div className={styles.resultMetadata}>
                        <div className={styles.metadataItem}>
                          <Icon name="clock" size="sm" />
                          <span>处理时间: {currentData.metadata.processingTime?.toFixed(0)}ms</span>
                        </div>
                        <div className={styles.metadataItem}>
                          <Icon name="bulb" size="sm" />
                          <span>置信度: {(currentData.metadata.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.resultEmpty}>
                    <Icon name="file" size="xl" variant="secondary" />
                    <p>暂无处理结果</p>
                    <p className={styles.emptyHint}>输入内容并点击"开始处理"查看结果</p>
                  </div>
                )}
              </div>
            </Card>

            {/* History card */}
            <Card className={styles.historyCard} variant="outlined">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Icon name="history" />
                  <span>处理历史</span>
                </h3>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="small" onClick={resetFilters}>
                    重置筛选
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => alert('刷新历史')}>
                    <Icon name="reload" spin={isLoading} />
                  </Button>
                </div>
              </div>

              <div className={styles.historyContent}>
                {data.length > 0 ? (
                  <>
                    <div className={styles.historyList}>
                      {data.slice(0, 5).map(item => (
                        <div key={item.id} className={styles.historyItem}>
                          <div className={styles.historyItemMain}>
                            <div className={styles.historyTitle}>{item.title}</div>
                            <div className={styles.historyDescription}>{item.description}</div>
                            <div className={styles.historyMeta}>
                              <span className={styles.historyTime}>
                                {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                              <span
                                className={classNames(
                                  styles.historyStatus,
                                  styles[`status-${item.status}`]
                                )}
                              >
                                {item.status === 'active'
                                  ? '活跃'
                                  : item.status === 'pending'
                                    ? '待处理'
                                    : '已完成'}
                              </span>
                            </div>
                          </div>
                          <div className={styles.historyItemActions}>
                            <button
                              className={styles.historyAction}
                              onClick={() => alert(`查看详情: ${item.id}`)}
                              title="查看详情"
                            >
                              <Icon name="eye" size="sm" />
                            </button>
                            <button
                              className={classNames(styles.historyAction, styles.danger)}
                              onClick={() => handleDeleteItem(item.id)}
                              title="删除"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <div className={styles.loadMore}>
                        <Button
                          variant="ghost"
                          size="medium"
                          onClick={handleLoadMore}
                          loading={isLoading}
                          fullWidth
                        >
                          {isLoading ? '加载中...' : `加载更多 (第 ${page} 页)`}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.historyEmpty}>
                    <Icon name="inbox" size="xl" variant="secondary" />
                    <p>暂无历史记录</p>
                    <p className={styles.emptyHint}>处理任务后会显示在这里</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick actions card */}
            <Card className={styles.actionsCard} variant="filled">
              <h4 className={styles.actionsTitle}>快捷操作</h4>
              <div className={styles.actionsGrid}>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<Icon name="save" />}
                  onClick={() => alert('保存模板')}
                  fullWidth
                >
                  保存为模板
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<Icon name="share" />}
                  onClick={() => alert('分享结果')}
                  fullWidth
                >
                  分享结果
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<Icon name="bulb" />}
                  onClick={() => alert('查看建议')}
                  fullWidth
                >
                  获取建议
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<Icon name="code" />}
                  onClick={() => alert('API文档')}
                  fullWidth
                >
                  API文档
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <Icon name="warning" variant="error" />
              <span>{error}</span>
            </div>
            <button
              className={styles.errorClose}
              onClick={() => setError(null)}
              aria-label="关闭错误提示"
            >
              <Icon name="close" />
            </button>
          </div>
        )}

        {/* Footer note */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            <Icon name="info" size="sm" />
            <span>模块一功能正在开发中，部分功能可能无法使用。</span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Module1
