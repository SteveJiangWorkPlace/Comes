/**
 * Module 1 page - Student Application Information Processing
 * AI-powered document analysis for student applications using Google GenAI
 */

import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import { useModule1Store } from '../../store/module1.store'
import type {
  ApplicantInfo,
  EducationBackground,
  LanguageTest,
  WorkExperience,
  Recommender,
} from '../../store/module1.store'
import styles from './Module1.module.css'

const Module1: React.FC = () => {
  const {
    // State
    currentApplication,
    applicationHistory,
    isProcessing,
    processingError,
    files,
    isUploading,
    uploadProgress,
    uploadError,
    showAdvancedOptions,
    showRawAnalysis,
    showTemplate,
    selectedView,
    processingOptions,
    processingStats,

    // Actions
    setFile,
    clearFiles,
    uploadAndAnalyze,
    analyzeApplication,
    getApplication,
    getTemplate,
    setShowAdvancedOptions,
    setShowRawAnalysis,
    setShowTemplate,
    setSelectedView,
    updateProcessingOptions,
    resetProcessingOptions,
    addToHistory,
    clearHistory,
    removeFromHistory,
    refreshHistory,
    setProcessingError,
    setUploadError,
    reset,
    copyApplicantInfo,
    copyEducationInfo,
    copyLanguageTestInfo,
    copyFullSummary,
  } = useModule1Store()

  const fileInputRefs = {
    transcript: useRef<HTMLInputElement>(null),
    degree_certificate: useRef<HTMLInputElement>(null),
    resume: useRef<HTMLInputElement>(null),
    ielts_score: useRef<HTMLInputElement>(null),
  }

  // Handle file selection
  const handleFileSelect = (
    fileKey: keyof typeof files,
    event: React.ChangeEvent<HTMLInputElement>,
    ref?: React.RefObject<HTMLInputElement | null>
  ) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('请选择PDF、Word、JPG、PNG或TXT格式的文件')
        if (ref?.current) ref.current.value = ''
        return
      }

      // Check file size (max 16MB)
      if (selectedFile.size > 16 * 1024 * 1024) {
        alert('文件大小不能超过16MB')
        if (ref?.current) ref.current.value = ''
        return
      }

      setFile(fileKey, selectedFile)
      setUploadError(null)
    }
  }

  // Handle upload and analysis
  const handleUploadAndAnalyze = async () => {
    try {
      const result = await uploadAndAnalyze()
      if (result) {
        console.log('Analysis completed:', result)
        setSelectedView('result')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  // Handle copy action with feedback
  const handleCopyWithFeedback = async (
    copyFn: () => Promise<void>,
    successMessage: string
  ) => {
    try {
      await copyFn()
      alert(successMessage)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('复制失败，请手动复制')
    }
  }

  // Render file upload area
  const renderFileUploadArea = (
    fileKey: keyof typeof files,
    label: string,
    description: string,
    required: boolean = true
  ) => {
    const file = files[fileKey]
    const ref = fileInputRefs[fileKey]

    return (
      <div className={styles.fileUploadArea}>
        <div className={styles.fileUploadHeader}>
          <Icon name="file-text" variant="primary" />
          <h4>
            {label} {required && <span className={styles.requiredStar}>*</span>}
          </h4>
        </div>
        <div className={styles.fileUploadContent}>
          {file ? (
            <div className={styles.filePreview}>
              <Icon name="file" size="lg" variant="success" />
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                className={styles.removeFileButton}
                onClick={() => {
                  setFile(fileKey, null)
                  if (ref.current) ref.current.value = ''
                }}
              >
                <Icon name="close" />
              </button>
            </div>
          ) : (
            <div
              className={styles.fileDropzone}
              onClick={() => ref.current?.click()}
            >
              <Icon name="upload" size="xl" variant="secondary" />
              <p>点击选择{label}文件</p>
              <p className={styles.fileDropzoneHint}>{description}</p>
              <input
                ref={ref}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={e => handleFileSelect(fileKey, e, ref)}
                className={styles.fileInput}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render applicant information section
  const renderApplicantInfo = (info: ApplicantInfo) => (
    <Card className={styles.infoCard} variant="filled">
      <div className={styles.infoHeader}>
        <h4>申请人信息</h4>
        <button
          className={styles.copyButton}
          onClick={() =>
            handleCopyWithFeedback(
              () => copyApplicantInfo(info),
              '申请人信息已复制到剪贴板'
            )
          }
          title="复制申请人信息"
        >
          <Icon name="copy" size="sm" />
        </button>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>姓名/性别</span>
          <span className={styles.infoValue}>
            {info.name || '未提供'} / {info.gender || '未提供'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>出生日期</span>
          <span className={styles.infoValue}>{info.birth_date || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>护照号码</span>
          <span className={styles.infoValue}>{info.passport_number || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>护照签发/过期</span>
          <span className={styles.infoValue}>
            {info.passport_issue_date || '未提供'} / {info.passport_expiry_date || '未提供'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>联系电话</span>
          <span className={styles.infoValue}>{info.phone || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>申请邮箱</span>
          <span className={styles.infoValue}>{info.email || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>国内地址</span>
          <span className={styles.infoValue}>
            {info.domestic_address || '未提供'} (邮编: {info.postal_code || '未提供'})
          </span>
        </div>
      </div>
    </Card>
  )

  // Render education background section
  const renderEducationBackground = (education: EducationBackground) => (
    <Card className={styles.infoCard} variant="filled">
      <div className={styles.infoHeader}>
        <h4>教育背景</h4>
        <button
          className={styles.copyButton}
          onClick={() =>
            handleCopyWithFeedback(
              () => copyEducationInfo(education),
              '教育背景信息已复制到剪贴板'
            )
          }
          title="复制教育背景信息"
        >
          <Icon name="copy" size="sm" />
        </button>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>所在院校</span>
          <span className={styles.infoValue}>{education.university || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>就读专业</span>
          <span className={styles.infoValue}>{education.major || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>就读时间</span>
          <span className={styles.infoValue}>
            {education.study_period.start_date || '未提供'} 至{' '}
            {education.study_period.end_date || '未提供'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>预计学位</span>
          <span className={styles.infoValue}>{education.expected_degree || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>绩点 (GPA)</span>
          <span className={styles.infoValue}>
            {education.gpa.score || '未提供'} / {education.gpa.scale || '未提供'}
          </span>
        </div>
      </div>
    </Card>
  )

  // Render language test section
  const renderLanguageTest = (languageTest: LanguageTest) => (
    <Card className={styles.infoCard} variant="filled">
      <div className={styles.infoHeader}>
        <h4>语言成绩</h4>
        <button
          className={styles.copyButton}
          onClick={() =>
            handleCopyWithFeedback(
              () => copyLanguageTestInfo(languageTest),
              '语言成绩信息已复制到剪贴板'
            )
          }
          title="复制语言成绩信息"
        >
          <Icon name="copy" size="sm" />
        </button>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>考试类型</span>
          <span className={styles.infoValue}>{languageTest.test_type || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>考试日期</span>
          <span className={styles.infoValue}>{languageTest.test_date || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Reference Number</span>
          <span className={styles.infoValue}>{languageTest.reference_number || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>总分</span>
          <span className={styles.infoValue}>{languageTest.total_score || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>听力</span>
          <span className={styles.infoValue}>{languageTest.sections.listening || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>阅读</span>
          <span className={styles.infoValue}>{languageTest.sections.reading || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>写作</span>
          <span className={styles.infoValue}>{languageTest.sections.writing || '未提供'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>口语</span>
          <span className={styles.infoValue}>{languageTest.sections.speaking || '未提供'}</span>
        </div>
      </div>
    </Card>
  )

  // Render work experience section
  const renderWorkExperience = (workExperience: WorkExperience[]) => {
    if (!workExperience || workExperience.length === 0) {
      return (
        <Card className={styles.infoCard} variant="filled">
          <h4>工作经历</h4>
          <p className={styles.emptyText}>暂无工作经历信息</p>
        </Card>
      )
    }

    return (
      <Card className={styles.infoCard} variant="filled">
        <h4>工作经历 ({workExperience.length}段)</h4>
        <div className={styles.workExperienceList}>
          {workExperience.map((work, index) => (
            <div key={index} className={styles.workExperienceItem}>
              <div className={styles.workHeader}>
                <h5>{work.position || '未提供职位'}</h5>
                <span className={styles.workCompany}>{work.company_name || '未提供公司'}</span>
              </div>
              <div className={styles.workDetails}>
                <div className={styles.workDetail}>
                  <Icon name="calendar" size="sm" variant="secondary" />
                  <span>
                    {work.work_period.start_date || '未提供'} 至{' '}
                    {work.work_period.end_date || '未提供'}
                  </span>
                </div>
                <div className={styles.workDetail}>
                  <Icon name="location" size="sm" variant="secondary" />
                  <span>{work.company_address || '未提供地址'}</span>
                </div>
              </div>
              {work.job_description && (
                <p className={styles.workDescription}>{work.job_description}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Render recommenders section
  const renderRecommenders = (recommenders: Recommender[]) => {
    if (!recommenders || recommenders.length === 0) {
      return (
        <Card className={styles.infoCard} variant="filled">
          <h4>推荐人信息</h4>
          <p className={styles.emptyText}>暂无推荐人信息</p>
        </Card>
      )
    }

    return (
      <Card className={styles.infoCard} variant="filled">
        <h4>推荐人信息 ({recommenders.length}位)</h4>
        <div className={styles.recommendersList}>
          {recommenders.map((recommender, index) => (
            <div key={index} className={styles.recommenderItem}>
              <div className={styles.recommenderHeader}>
                <h5>{recommender.name || '未提供姓名'}</h5>
                <span className={styles.recommenderTitle}>{recommender.title || '未提供职称'}</span>
              </div>
              <div className={styles.recommenderDetails}>
                <div className={styles.recommenderDetail}>
                  <Icon name="link" size="sm" variant="secondary" />
                  <span>关系: {recommender.relationship || '未提供'}</span>
                </div>
                <div className={styles.recommenderDetail}>
                  <Icon name="building" size="sm" variant="secondary" />
                  <span>单位: {recommender.organization || '未提供'}</span>
                </div>
                <div className={styles.recommenderDetail}>
                  <Icon name="location" size="sm" variant="secondary" />
                  <span>
                    {recommender.organization_address || '未提供地址'} (邮编:{' '}
                    {recommender.postal_code || '未提供'})
                  </span>
                </div>
                <div className={styles.recommenderDetail}>
                  <Icon name="mail" size="sm" variant="secondary" />
                  <span>邮箱: {recommender.email || '未提供'}</span>
                </div>
                <div className={styles.recommenderDetail}>
                  <Icon name="phone" size="sm" variant="secondary" />
                  <span>电话: {recommender.phone || '未提供'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Check if all required files are uploaded
  const allFilesUploaded = () => {
    const requiredFiles = ['transcript', 'degree_certificate', 'resume', 'ielts_score'] as const
    return requiredFiles.every(fileKey => files[fileKey])
  }

  // Toggle advanced options
  const toggleAdvanced = () => {
    setShowAdvancedOptions(!showAdvancedOptions)
  }

  // Handle clear files
  const handleClearFiles = () => {
    clearFiles()
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = ''
    })
    setUploadError(null)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('zh-CN')
    } catch {
      return dateString || '未提供'
    }
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>智能文档分析</h1>
            <p className={styles.subtitle}>
              通过成绩单、学位证书、个人简历和雅思成绩单，使用AI智能提取和分析学生申请信息
            </p>
          </div>
          <div className={styles.headerRight}>
            <Button
              variant="ghost"
              size="medium"
              leftIcon={<Icon name="info" />}
              onClick={() => alert('上传四类必需文件：成绩单、学位证书、简历、雅思成绩单\n系统将自动提取和分析学生申请信息')}
            >
              使用说明
            </Button>
            <Button
              variant="secondary"
              size="medium"
              leftIcon={<Icon name="setting" />}
              onClick={toggleAdvanced}
            >
              {showAdvancedOptions ? '隐藏高级选项' : '显示高级选项'}
            </Button>
          </div>
        </header>

        {/* View selector */}
        <div className={styles.viewSelector}>
          <div className={styles.viewTabs}>
            {(['form', 'result', 'history'] as const).map(view => (
              <button
                key={view}
                className={classNames(styles.viewTab, {
                  [styles.activeViewTab]: selectedView === view,
                })}
                onClick={() => setSelectedView(view)}
              >
                <Icon
                  name={
                    view === 'form'
                      ? 'upload'
                      : view === 'result'
                      ? 'check'
                      : 'history'
                  }
                  size="sm"
                />
                <span>
                  {view === 'form' ? '文件上传' : view === 'result' ? '分析结果' : '历史记录'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className={styles.content}>
          {/* Show form view */}
          {selectedView === 'form' && (
            <div className={styles.formView}>
              <div className={styles.fileUploadGrid}>
                {renderFileUploadArea(
                  'transcript',
                  '成绩单',
                  '支持PDF、Word、图片格式的成绩单文件',
                  true
                )}
                {renderFileUploadArea(
                  'degree_certificate',
                  '学位证书',
                  '支持PDF、Word、图片格式的学位证书文件',
                  true
                )}
                {renderFileUploadArea(
                  'resume',
                  '个人简历',
                  '支持PDF、Word、TXT格式的简历文件',
                  true
                )}
                {renderFileUploadArea(
                  'ielts_score',
                  '雅思成绩单',
                  '支持PDF、图片格式的雅思成绩单文件',
                  true
                )}
              </div>

              {/* Processing options */}
              {showAdvancedOptions && (
                <Card className={styles.optionsCard} variant="outlined">
                  <div className={styles.optionsHeader}>
                    <h4>
                      <Icon name="tool" />
                      <span>处理选项</span>
                    </h4>
                  </div>
                  <div className={styles.optionsContent}>
                    <div className={styles.optionGroup}>
                      <label className={styles.optionLabel}>
                        <input
                          type="checkbox"
                          checked={processingOptions.autoAnalyze}
                          onChange={e =>
                            updateProcessingOptions({ autoAnalyze: e.target.checked })
                          }
                        />
                        <span>上传后自动分析</span>
                      </label>
                      <label className={styles.optionLabel}>
                        <input
                          type="checkbox"
                          checked={processingOptions.generateSummary}
                          onChange={e =>
                            updateProcessingOptions({ generateSummary: e.target.checked })
                          }
                        />
                        <span>生成结构化摘要</span>
                      </label>
                    </div>
                    <div className={styles.optionGroup}>
                      <label className={styles.optionLabel}>
                        <span>置信度阈值:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={processingOptions.confidenceThreshold * 100}
                          onChange={e =>
                            updateProcessingOptions({
                              confidenceThreshold: parseInt(e.target.value) / 100,
                            })
                          }
                        />
                        <span>{Math.round(processingOptions.confidenceThreshold * 100)}%</span>
                      </label>
                      <label className={styles.optionLabel}>
                        <span>输出语言:</span>
                        <select
                          value={processingOptions.preferredLanguage}
                          onChange={e =>
                            updateProcessingOptions({
                              preferredLanguage: e.target.value as 'zh' | 'en',
                            })
                          }
                        >
                          <option value="zh">中文</option>
                          <option value="en">English</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </Card>
              )}

              {/* Upload progress and actions */}
              <div className={styles.uploadSection}>
                <Card className={styles.uploadCard} variant="filled">
                  <div className={styles.uploadHeader}>
                    <h4>
                      <Icon name="rocket" />
                      <span>文件上传与分析</span>
                    </h4>
                    <div className={styles.fileStats}>
                      <span>
                        已上传文件: {Object.keys(files).filter(k => files[k as keyof typeof files]).length}/4
                      </span>
                    </div>
                  </div>

                  {/* Upload progress */}
                  {isUploading && (
                    <div className={styles.progressSection}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className={styles.progressText}>
                        <span>上传中... {Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className={styles.actionButtons}>
                    <Button
                      variant="secondary"
                      size="large"
                      onClick={handleClearFiles}
                      disabled={isUploading || isProcessing}
                      leftIcon={<Icon name="delete" />}
                    >
                      清空文件
                    </Button>
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleUploadAndAnalyze}
                      disabled={!allFilesUploaded() || isUploading || isProcessing}
                      loading={isUploading || isProcessing}
                      leftIcon={<Icon name="rocket" />}
                    >
                      {isUploading
                        ? '上传中...'
                        : isProcessing
                        ? '分析中...'
                        : '上传并分析'}
                    </Button>
                  </div>

                  {/* Upload error */}
                  {uploadError && (
                    <div className={styles.errorMessage}>
                      <Icon name="warning" variant="error" />
                      <span>{uploadError}</span>
                      <button
                        className={styles.errorClose}
                        onClick={() => setUploadError(null)}
                        aria-label="关闭错误提示"
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                  )}
                </Card>
              </div>

              {/* Statistics */}
              <Card className={styles.statsCard} variant="outlined">
                <div className={styles.statsHeader}>
                  <h4>
                    <Icon name="barChart" variant="primary" />
                    <span>统计信息</span>
                  </h4>
                </div>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>总处理次数</div>
                    <div className={styles.statValue}>{processingStats.totalApplications}</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>成功处理</div>
                    <div className={styles.statValue}>{processingStats.successfulApplications}</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>平均置信度</div>
                    <div className={styles.statValue}>
                      {processingStats.averageConfidence > 0
                        ? `${(processingStats.averageConfidence * 100).toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>平均耗时</div>
                    <div className={styles.statValue}>
                      {processingStats.averageProcessingTime > 0
                        ? `${processingStats.averageProcessingTime.toFixed(1)}秒`
                        : '-'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Show result view */}
          {selectedView === 'result' && (
            <div className={styles.resultView}>
              {currentApplication ? (
                <>
                  {/* Result header */}
                  <Card className={styles.resultHeaderCard} variant="elevated">
                    <div className={styles.resultHeader}>
                      <div className={styles.resultTitle}>
                        <h3>
                          <Icon name="check" variant="success" />
                          <span>分析结果</span>
                        </h3>
                        <p className={styles.resultSubtitle}>
                          学生: {currentApplication.analysis_result?.applicant_info?.name || '未知'}
                          {' · '}
                          状态: <span className={styles.resultStatus}>{currentApplication.status}</span>
                          {' · '}
                          分析时间: {formatDate(currentApplication.created_at)}
                        </p>
                      </div>
                      <div className={styles.resultActions}>
                        {currentApplication.structured_summary && (
                          <Button
                            variant="secondary"
                            size="medium"
                            onClick={() =>
                              handleCopyWithFeedback(
                                () => copyFullSummary(currentApplication.structured_summary!),
                                '完整摘要已复制到剪贴板'
                              )
                            }
                            leftIcon={<Icon name="copy" />}
                          >
                            复制摘要
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="medium"
                          onClick={() => setSelectedView('form')}
                          leftIcon={<Icon name="arrow-left" />}
                        >
                          返回上传
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Analysis results */}
                  {currentApplication.analysis_result && (
                    <div className={styles.analysisResults}>
                      {currentApplication.analysis_result.applicant_info &&
                        renderApplicantInfo(currentApplication.analysis_result.applicant_info)}

                      {currentApplication.analysis_result.education_background &&
                        renderEducationBackground(
                          currentApplication.analysis_result.education_background
                        )}

                      {currentApplication.analysis_result.language_test &&
                        renderLanguageTest(currentApplication.analysis_result.language_test)}

                      {currentApplication.analysis_result.work_experience &&
                        renderWorkExperience(currentApplication.analysis_result.work_experience)}

                      {currentApplication.analysis_result.recommenders &&
                        renderRecommenders(currentApplication.analysis_result.recommenders)}

                      {/* Raw analysis */}
                      {showRawAnalysis && currentApplication.analysis_result.raw_response && (
                        <Card className={styles.rawAnalysisCard} variant="filled">
                          <div className={styles.rawAnalysisHeader}>
                            <h4>
                              <Icon name="code" />
                              <span>原始分析结果</span>
                            </h4>
                            <button
                              className={styles.toggleButton}
                              onClick={() => setShowRawAnalysis(false)}
                            >
                              <Icon name="eye-off" />
                              <span>隐藏</span>
                            </button>
                          </div>
                          <pre className={styles.rawAnalysisContent}>
                            {currentApplication.analysis_result.raw_response}
                          </pre>
                        </Card>
                      )}

                      {!showRawAnalysis && currentApplication.analysis_result.raw_response && (
                        <div className={styles.showRawButton}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => setShowRawAnalysis(true)}
                          >
                            <Icon name="eye" />
                            <span>显示原始分析结果</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error message if any */}
                  {currentApplication.error_message && (
                    <Card className={styles.errorCard} variant="filled">
                      <div className={styles.errorCardHeader}>
                        <Icon name="warning" variant="error" />
                        <h4>分析错误</h4>
                      </div>
                      <p className={styles.errorMessageText}>{currentApplication.error_message}</p>
                    </Card>
                  )}

                  {/* Processing error */}
                  {processingError && (
                    <Card className={styles.errorCard} variant="filled">
                      <div className={styles.errorCardHeader}>
                        <Icon name="warning" variant="error" />
                        <h4>处理错误</h4>
                      </div>
                      <p className={styles.errorMessageText}>{processingError}</p>
                      <button
                        className={styles.errorCloseButton}
                        onClick={() => setProcessingError(null)}
                      >
                        <Icon name="close" />
                        <span>关闭</span>
                      </button>
                    </Card>
                  )}
                </>
              ) : (
                <Card className={styles.noResultCard} variant="filled">
                  <div className={styles.noResultContent}>
                    <Icon name="file" size="xl" variant="secondary" />
                    <h4>暂无分析结果</h4>
                    <p>请先上传文件并进行分析</p>
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={() => setSelectedView('form')}
                      leftIcon={<Icon name="arrow-left" />}
                    >
                      前往文件上传
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Show history view */}
          {selectedView === 'history' && (
            <div className={styles.historyView}>
              <Card className={styles.historyCard} variant="elevated">
                <div className={styles.historyHeader}>
                  <h3>
                    <Icon name="history" />
                    <span>处理历史</span>
                  </h3>
                  <div className={styles.historyActions}>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={refreshHistory}
                      leftIcon={<Icon name="reload" />}
                    >
                      刷新
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={clearHistory}
                      leftIcon={<Icon name="delete" />}
                    >
                      清空历史
                    </Button>
                  </div>
                </div>

                <div className={styles.historyContent}>
                  {applicationHistory.length > 0 ? (
                    <div className={styles.historyList}>
                      {applicationHistory.map(item => (
                        <div key={item.id} className={styles.historyItem}>
                          <div className={styles.historyItemMain}>
                            <div className={styles.historyHeaderRow}>
                              <h5 className={styles.historyTitle}>{item.student_name}</h5>
                              <span
                                className={classNames(styles.historyStatus, {
                                  [styles.statusCompleted]: item.status === 'completed',
                                  [styles.statusFailed]: item.status === 'failed',
                                  [styles.statusProcessing]: item.status === 'processing',
                                })}
                              >
                                {item.status === 'completed'
                                  ? '已完成'
                                  : item.status === 'failed'
                                  ? '失败'
                                  : '处理中'}
                              </span>
                            </div>
                            <div className={styles.historyDetails}>
                              <div className={styles.historyDetail}>
                                <Icon name="university" size="sm" />
                                <span>{item.university}</span>
                              </div>
                              <div className={styles.historyDetail}>
                                <Icon name="graduation-cap" size="sm" />
                                <span>{item.degree}</span>
                              </div>
                              <div className={styles.historyDetail}>
                                <Icon name="calendar" size="sm" />
                                <span>{formatDate(item.uploaded_at)}</span>
                              </div>
                              <div className={styles.historyDetail}>
                                <Icon name="file" size="sm" />
                                <span>{item.file_count}个文件</span>
                              </div>
                            </div>
                            <p className={styles.historyPreview}>{item.preview}...</p>
                          </div>
                          <div className={styles.historyItemActions}>
                            <button
                              className={styles.historyAction}
                              onClick={async () => {
                                const app = await getApplication(item.id)
                                if (app) {
                                  setSelectedView('result')
                                }
                              }}
                              title="查看详情"
                            >
                              <Icon name="eye" size="sm" />
                            </button>
                            <button
                              className={classNames(styles.historyAction, styles.dangerAction)}
                              onClick={() => {
                                if (confirm(`确定要删除 ${item.student_name} 的记录吗？`)) {
                                  removeFromHistory(item.id)
                                }
                              }}
                              title="删除记录"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.historyEmpty}>
                      <Icon name="inbox" size="xl" variant="secondary" />
                      <h4>暂无历史记录</h4>
                      <p>处理任务后会显示在这里</p>
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => setSelectedView('form')}
                        leftIcon={<Icon name="arrow-left" />}
                      >
                        开始分析
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Global error display */}
        {(uploadError || processingError) && !isUploading && !isProcessing && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <Icon name="warning" variant="error" />
              <span>{uploadError || processingError}</span>
            </div>
            <button
              className={styles.errorClose}
              onClick={() => {
                setUploadError(null)
                setProcessingError(null)
              }}
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
            <span>智能文档分析功能已就绪。上传成绩单、学位证书、简历和雅思成绩单文件即可开始分析。</span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Module1
