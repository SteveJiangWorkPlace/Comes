/**
 * Module 2 page - Transcript Verification
 * AI-powered transcript verification with Google Gemini
 */

import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import AppLayout from '../../components/layout/AppLayout/AppLayout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import { useModule2Store } from '../../store/module2.store'
import type { CourseInfo, Semester } from '../../types/transcript.types'
import styles from './Module2.module.css'

const Module2: React.FC = () => {
  const {
    // State
    currentVerification,
    verificationHistory,
    isVerifying,
    verificationError,
    uploadType,
    files,
    isUploading,
    uploadProgress,
    uploadError,
    selectedSemesterIndex,
    showRawData,
    showConfidenceScores,
    verificationOptions,
    verificationStats,

    // Actions
    setUploadType,
    setFile,
    uploadAndVerify,
    setSelectedSemester,
    toggleRawData,
    toggleConfidenceScores,
    updateVerificationOptions,
    copyCourseInfo,
    copySemesterInfo,
    copyStudentInfo,
    setVerificationError,
    setUploadError,
    reset,
  } = useModule2Store()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputZhRef = useRef<HTMLInputElement>(null)
  const fileInputEnRef = useRef<HTMLInputElement>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Handle file selection
  const handleFileSelect = (
    fileKey: keyof typeof files,
    event: React.ChangeEvent<HTMLInputElement>,
    ref?: React.RefObject<HTMLInputElement | null>
  ) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('请选择PDF、JPG或PNG格式的文件')
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

  // Handle upload and verification
  const handleUploadAndVerify = async () => {
    try {
      const result = await uploadAndVerify()
      if (result) {
        console.log('Verification completed:', result)
      }
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }

  // Handle copy action with feedback
  const handleCopyWithFeedback = async (copyFn: () => Promise<void>, successMessage: string) => {
    try {
      await copyFn()
      alert(successMessage)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('复制失败，请手动复制')
    }
  }

  // Render course type badge
  const renderCourseTypeBadge = (type: CourseInfo['type']) => {
    const typeColors: Record<string, string> = {
      core: 'var(--color-red-100)',
      major: 'var(--color-blue-100)',
      elective: 'var(--color-green-100)',
      general: 'var(--color-purple-100)',
      required: 'var(--color-orange-100)',
      optional: 'var(--color-yellow-100)',
      practical: 'var(--color-teal-100)',
      thesis: 'var(--color-pink-100)',
      internship: 'var(--color-indigo-100)',
      language: 'var(--color-cyan-100)',
    }

    const textColors: Record<string, string> = {
      core: 'var(--color-red-800)',
      major: 'var(--color-blue-800)',
      elective: 'var(--color-green-800)',
      general: 'var(--color-purple-800)',
      required: 'var(--color-orange-800)',
      optional: 'var(--color-yellow-800)',
      practical: 'var(--color-teal-800)',
      thesis: 'var(--color-pink-800)',
      internship: 'var(--color-indigo-800)',
      language: 'var(--color-cyan-800)',
    }

    return (
      <span
        className={styles.courseTypeBadge}
        style={{
          backgroundColor: typeColors[type.type] || 'var(--color-gray-100)',
          color: textColors[type.type] || 'var(--color-gray-800)',
        }}
      >
        {type.zh}
      </span>
    )
  }

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence: number) => {
    let color = 'var(--color-red-500)'
    if (confidence >= 0.8) color = 'var(--color-green-500)'
    else if (confidence >= 0.6) color = 'var(--color-yellow-500)'

    return (
      <div className={styles.confidenceIndicator}>
        <div
          className={styles.confidenceBar}
          style={{
            width: `${confidence * 100}%`,
            backgroundColor: color,
          }}
        />
        <span className={styles.confidenceText}>{Math.round(confidence * 100)}%</span>
      </div>
    )
  }

  // Render course card
  const renderCourseCard = (course: CourseInfo, index: number, _semesterIndex: number) => {
    return (
      <Card key={course.id || index} className={styles.courseCard} variant="outlined">
        <div className={styles.courseHeader}>
          <div className={styles.courseTitle}>
            <h4>{course.nameZh}</h4>
            <p className={styles.courseSubtitle}>{course.nameEn}</p>
          </div>
          <div className={styles.courseActions}>
            <button
              className={styles.copyButton}
              onClick={() =>
                handleCopyWithFeedback(() => copyCourseInfo(course), '课程信息已复制到剪贴板')
              }
              title="复制课程信息"
            >
              <Icon name="copy" size="sm" />
            </button>
          </div>
        </div>

        <div className={styles.courseContent}>
          <div className={styles.courseMeta}>
            {course.code && (
              <div className={styles.courseMetaItem}>
                <Icon name="hash" size="sm" variant="secondary" />
                <span>{course.code}</span>
              </div>
            )}
            <div className={styles.courseMetaItem}>
              <Icon name="book" size="sm" variant="secondary" />
              <span>{renderCourseTypeBadge(course.type)}</span>
            </div>
            <div className={styles.courseMetaItem}>
              <Icon name="star" size="sm" variant="secondary" />
              <span>{course.credits} 学分</span>
            </div>
            {course.grade && (
              <div className={styles.courseMetaItem}>
                <Icon name="chart" size="sm" variant="secondary" />
                <span>成绩: {course.grade}</span>
              </div>
            )}
          </div>

          {course.description && <p className={styles.courseDescription}>{course.description}</p>}

          {course.confidence && showConfidenceScores && (
            <div className={styles.courseConfidence}>
              <span>识别置信度:</span>
              {renderConfidenceIndicator(course.confidence)}
            </div>
          )}
        </div>
      </Card>
    )
  }

  // Render semester card
  const renderSemesterCard = (semester: Semester, index: number) => {
    const isSelected = selectedSemesterIndex === index

    return (
      <Card
        key={semester.id || index}
        className={classNames(styles.semesterCard, {
          [styles.selected]: isSelected,
        })}
        variant={isSelected ? 'elevated' : 'outlined'}
      >
        <div className={styles.semesterHeader}>
          <div className={styles.semesterTitle}>
            <h3>{semester.nameZh}</h3>
            <p className={styles.semesterSubtitle}>
              {semester.nameEn} • {semester.academicYear}
            </p>
          </div>
          <div className={styles.semesterActions}>
            <button
              className={styles.copyButton}
              onClick={() =>
                handleCopyWithFeedback(() => copySemesterInfo(semester), '学期信息已复制到剪贴板')
              }
              title="复制学期信息"
            >
              <Icon name="copy" size="sm" />
            </button>
            <button
              className={styles.expandButton}
              onClick={() => setSelectedSemester(isSelected ? -1 : index)}
              title={isSelected ? '折叠课程' : '展开课程'}
            >
              <Icon name={isSelected ? 'chevron-up' : 'chevron-down'} size="sm" />
            </button>
          </div>
        </div>

        <div className={styles.semesterMeta}>
          <div className={styles.semesterMetaItem}>
            <Icon name="calendar" size="sm" variant="secondary" />
            <span>
              {semester.startDate || '未提供'} - {semester.endDate || '未提供'}
            </span>
          </div>
          <div className={styles.semesterMetaItem}>
            <Icon name="book" size="sm" variant="secondary" />
            <span>{semester.courses.length} 门课程</span>
          </div>
          <div className={styles.semesterMetaItem}>
            <Icon name="star" size="sm" variant="secondary" />
            <span>{semester.totalCredits} 学分</span>
          </div>
          {semester.semesterGPA && (
            <div className={styles.semesterMetaItem}>
              <Icon name="chart" size="sm" variant="secondary" />
              <span>学期GPA: {semester.semesterGPA.toFixed(2)}</span>
            </div>
          )}
        </div>

        {isSelected && (
          <div className={styles.coursesGrid}>
            {semester.courses.map((course, courseIndex) =>
              renderCourseCard(course, courseIndex, index)
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>成绩单认证</h1>
            <p className={styles.subtitle}>
              使用Google Gemini AI自动识别和验证成绩单信息，支持双语成绩单和分开的中英文成绩单
            </p>
          </div>
          <div className={styles.headerRight}>
            <Button
              variant="ghost"
              size="medium"
              leftIcon={<Icon name="info" />}
              onClick={() =>
                alert(`使用说明：
1. 选择上传方式：单文件（双语）或分开上传（中英文）
2. 选择成绩单文件（支持PDF、JPG、PNG）
3. 点击"开始认证"进行AI识别
4. 查看认证结果，可复制各项信息
5. 使用高级选项调整识别参数`)
              }
            >
              使用说明
            </Button>
            <Button
              variant="secondary"
              size="medium"
              leftIcon={<Icon name="setting" />}
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? '隐藏高级选项' : '显示高级选项'}
            </Button>
            <Button
              variant="ghost"
              size="medium"
              leftIcon={<Icon name="refresh" />}
              onClick={reset}
            >
              重置
            </Button>
          </div>
        </header>

        {/* Main content - two column layout */}
        <div className={styles.content}>
          {/* Left column - Upload and controls */}
          <div className={styles.leftColumn}>
            {/* Upload card */}
            <Card className={styles.uploadCard} variant="elevated">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Icon name="upload" />
                  <span>成绩单上传</span>
                </h3>
              </div>

              <div className={styles.uploadSection}>
                {/* Upload type selection */}
                <div className={styles.uploadTypeSelection}>
                  <div className={styles.uploadTypeOptions}>
                    <button
                      className={classNames(styles.uploadTypeButton, {
                        [styles.active]: uploadType === 'single',
                      })}
                      onClick={() => setUploadType('single')}
                    >
                      <Icon name="file" />
                      <span>单文件上传（双语）</span>
                      <p className={styles.uploadTypeDescription}>同一文件包含中文和英文内容</p>
                    </button>
                    <button
                      className={classNames(styles.uploadTypeButton, {
                        [styles.active]: uploadType === 'separate',
                      })}
                      onClick={() => setUploadType('separate')}
                    >
                      <Icon name="files" />
                      <span>分开上传</span>
                      <p className={styles.uploadTypeDescription}>分别上传中文和英文成绩单</p>
                    </button>
                  </div>
                </div>

                {/* File upload areas */}
                <div className={styles.fileUploadAreas}>
                  {uploadType === 'single' ? (
                    <div className={styles.fileUploadArea}>
                      <div className={styles.fileUploadHeader}>
                        <Icon name="file-text" variant="primary" />
                        <h4>双语成绩单</h4>
                      </div>
                      <div className={styles.fileUploadContent}>
                        {files.transcript ? (
                          <div className={styles.filePreview}>
                            <Icon name="file" size="lg" variant="success" />
                            <div className={styles.fileInfo}>
                              <div className={styles.fileName}>{files.transcript.name}</div>
                              <div className={styles.fileSize}>
                                {(files.transcript.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <button
                              className={styles.removeFileButton}
                              onClick={() => {
                                setFile('transcript', null)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                              }}
                            >
                              <Icon name="close" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={styles.fileDropzone}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Icon name="upload" size="xl" variant="secondary" />
                            <p>点击选择文件或拖拽到此区域</p>
                            <p className={styles.fileDropzoneHint}>
                              支持PDF、JPG、PNG格式，最大16MB
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={e => handleFileSelect('transcript', e, fileInputRef)}
                              className={styles.fileInput}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.fileUploadArea}>
                        <div className={styles.fileUploadHeader}>
                          <Icon name="file-text" variant="primary" />
                          <h4>中文成绩单</h4>
                        </div>
                        <div className={styles.fileUploadContent}>
                          {files.transcriptZh ? (
                            <div className={styles.filePreview}>
                              <Icon name="file" size="lg" variant="success" />
                              <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{files.transcriptZh.name}</div>
                                <div className={styles.fileSize}>
                                  {(files.transcriptZh.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                              <button
                                className={styles.removeFileButton}
                                onClick={() => {
                                  setFile('transcriptZh', null)
                                  if (fileInputZhRef.current) fileInputZhRef.current.value = ''
                                }}
                              >
                                <Icon name="close" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={styles.fileDropzone}
                              onClick={() => fileInputZhRef.current?.click()}
                            >
                              <Icon name="upload" size="xl" variant="secondary" />
                              <p>点击选择中文成绩单</p>
                              <p className={styles.fileDropzoneHint}>
                                支持PDF、JPG、PNG格式，最大16MB
                              </p>
                              <input
                                ref={fileInputZhRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileSelect('transcriptZh', e, fileInputZhRef)}
                                className={styles.fileInput}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.fileUploadArea}>
                        <div className={styles.fileUploadHeader}>
                          <Icon name="file-text" variant="primary" />
                          <h4>英文成绩单</h4>
                        </div>
                        <div className={styles.fileUploadContent}>
                          {files.transcriptEn ? (
                            <div className={styles.filePreview}>
                              <Icon name="file" size="lg" variant="success" />
                              <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{files.transcriptEn.name}</div>
                                <div className={styles.fileSize}>
                                  {(files.transcriptEn.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                              <button
                                className={styles.removeFileButton}
                                onClick={() => {
                                  setFile('transcriptEn', null)
                                  if (fileInputEnRef.current) fileInputEnRef.current.value = ''
                                }}
                              >
                                <Icon name="close" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={styles.fileDropzone}
                              onClick={() => fileInputEnRef.current?.click()}
                            >
                              <Icon name="upload" size="xl" variant="secondary" />
                              <p>点击选择英文成绩单</p>
                              <p className={styles.fileDropzoneHint}>
                                支持PDF、JPG、PNG格式，最大16MB
                              </p>
                              <input
                                ref={fileInputEnRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileSelect('transcriptEn', e, fileInputEnRef)}
                                className={styles.fileInput}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Upload progress */}
                {isUploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className={styles.progressText}>
                      <span>上传中...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                )}

                {/* Advanced options */}
                {showAdvancedOptions && (
                  <div className={styles.advancedOptions}>
                    <div className={styles.advancedHeader}>
                      <Icon name="settings" size="sm" />
                      <span>高级选项</span>
                    </div>
                    <div className={styles.advancedGrid}>
                      <div className={styles.advancedOption}>
                        <label>首选语言</label>
                        <div className={styles.optionButtons}>
                          <button
                            className={classNames(styles.optionButton, {
                              [styles.active]: verificationOptions.preferredLanguage === 'zh',
                            })}
                            onClick={() => updateVerificationOptions({ preferredLanguage: 'zh' })}
                          >
                            中文优先
                          </button>
                          <button
                            className={classNames(styles.optionButton, {
                              [styles.active]: verificationOptions.preferredLanguage === 'en',
                            })}
                            onClick={() => updateVerificationOptions({ preferredLanguage: 'en' })}
                          >
                            英文优先
                          </button>
                        </div>
                      </div>
                      <div className={styles.advancedOption}>
                        <label>包含成绩</label>
                        <div className={styles.optionToggle}>
                          <button
                            className={classNames(styles.toggleButton, {
                              [styles.active]: verificationOptions.includeGrades,
                            })}
                            onClick={() =>
                              updateVerificationOptions({
                                includeGrades: !verificationOptions.includeGrades,
                              })
                            }
                          >
                            {verificationOptions.includeGrades ? '开启' : '关闭'}
                          </button>
                        </div>
                      </div>
                      <div className={styles.advancedOption}>
                        <label>计算GPA</label>
                        <div className={styles.optionToggle}>
                          <button
                            className={classNames(styles.toggleButton, {
                              [styles.active]: verificationOptions.calculateGPA,
                            })}
                            onClick={() =>
                              updateVerificationOptions({
                                calculateGPA: !verificationOptions.calculateGPA,
                              })
                            }
                          >
                            {verificationOptions.calculateGPA ? '开启' : '关闭'}
                          </button>
                        </div>
                      </div>
                      <div className={styles.advancedOption}>
                        <label>置信度阈值</label>
                        <div className={styles.optionSlider}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={verificationOptions.confidenceThreshold * 100}
                            onChange={e =>
                              updateVerificationOptions({
                                confidenceThreshold: parseInt(e.target.value) / 100,
                              })
                            }
                          />
                          <span>{Math.round(verificationOptions.confidenceThreshold * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className={styles.actionButtons}>
                  <Button
                    variant="primary"
                    size="large"
                    loading={isUploading || isVerifying}
                    onClick={handleUploadAndVerify}
                    disabled={
                      (uploadType === 'single' && !files.transcript) ||
                      (uploadType === 'separate' && (!files.transcriptZh || !files.transcriptEn))
                    }
                    leftIcon={<Icon name="rocket" />}
                    fullWidth
                  >
                    {isUploading ? '上传中...' : isVerifying ? '认证中...' : '开始认证'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stats card */}
            <Card className={styles.statsCard} variant="outlined">
              <div className={styles.statsHeader}>
                <h4 className={styles.statsTitle}>认证统计</h4>
                <Icon name="barChart" variant="primary" />
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>总认证次数</div>
                  <div className={styles.statValue}>{verificationStats.totalVerifications}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>成功率</div>
                  <div className={styles.statValue}>
                    {verificationStats.totalVerifications > 0
                      ? Math.round(
                          (verificationStats.successfulVerifications /
                            verificationStats.totalVerifications) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>平均置信度</div>
                  <div className={styles.statValue}>
                    {Math.round(verificationStats.averageConfidence * 100)}%
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>平均耗时</div>
                  <div className={styles.statValue}>
                    {verificationStats.averageProcessingTime > 0
                      ? `${verificationStats.averageProcessingTime.toFixed(1)}s`
                      : '--'}
                  </div>
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
                  <span>认证结果</span>
                </h3>
                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => toggleConfidenceScores()}
                    leftIcon={<Icon name="eye" />}
                  >
                    {showConfidenceScores ? '隐藏置信度' : '显示置信度'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => toggleRawData()}
                    leftIcon={<Icon name="code" />}
                  >
                    {showRawData ? '隐藏原始数据' : '显示原始数据'}
                  </Button>
                </div>
              </div>

              <div className={styles.resultContent}>
                {currentVerification ? (
                  <div className={styles.resultDisplay}>
                    {/* Student information */}
                    <Card className={styles.studentInfoCard} variant="filled">
                      <div className={styles.studentInfoHeader}>
                        <h4>学生信息</h4>
                        <button
                          className={styles.copyButton}
                          onClick={() =>
                            handleCopyWithFeedback(
                              () => copyStudentInfo(currentVerification.student),
                              '学生信息已复制到剪贴板'
                            )
                          }
                          title="复制学生信息"
                        >
                          <Icon name="copy" size="sm" />
                        </button>
                      </div>
                      <div className={styles.studentInfoGrid}>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>中文姓名</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.nameZh || '未提供'}
                          </span>
                        </div>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>英文姓名</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.nameEn || '未提供'}
                          </span>
                        </div>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>学号</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.studentId || '未提供'}
                          </span>
                        </div>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>院校</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.university || '未提供'}
                          </span>
                        </div>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>专业</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.major || '未提供'}
                          </span>
                        </div>
                        <div className={styles.studentInfoItem}>
                          <span className={styles.studentInfoLabel}>学位级别</span>
                          <span className={styles.studentInfoValue}>
                            {currentVerification.student.degreeLevel || '未提供'}
                          </span>
                        </div>
                        {currentVerification.student.overallGPA && (
                          <div className={styles.studentInfoItem}>
                            <span className={styles.studentInfoLabel}>总GPA</span>
                            <span className={styles.studentInfoValue}>
                              {currentVerification.student.overallGPA.toFixed(2)} /{' '}
                              {currentVerification.student.gpaScale}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Semesters */}
                    <div className={styles.semestersSection}>
                      <h4>学期信息 ({currentVerification.semesters.length}个学期)</h4>
                      <div className={styles.semestersList}>
                        {currentVerification.semesters.map((semester, index) =>
                          renderSemesterCard(semester, index)
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <Card className={styles.summaryCard} variant="outlined">
                      <h4>认证摘要</h4>
                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>总学分</span>
                          <span className={styles.summaryValue}>
                            {currentVerification.totalCredits}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>总课程数</span>
                          <span className={styles.summaryValue}>
                            {currentVerification.semesters.reduce(
                              (sum, semester) => sum + semester.courses.length,
                              0
                            )}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>认证时间</span>
                          <span className={styles.summaryValue}>
                            {new Date(
                              currentVerification.metadata?.verifiedAt || Date.now()
                            ).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>使用模型</span>
                          <span className={styles.summaryValue}>
                            {currentVerification.metadata?.modelUsed || '未知'}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Raw data (if enabled) */}
                    {showRawData && (
                      <div className={styles.rawDataSection}>
                        <h4>原始数据</h4>
                        <div className={styles.rawDataContent}>
                          <pre>{JSON.stringify(currentVerification, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.resultEmpty}>
                    <Icon name="file" size="xl" variant="secondary" />
                    <p>暂无认证结果</p>
                    <p className={styles.emptyHint}>上传成绩单并点击"开始认证"查看结果</p>
                  </div>
                )}
              </div>
            </Card>

            {/* History card */}
            <Card className={styles.historyCard} variant="outlined">
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Icon name="history" />
                  <span>认证历史</span>
                </h3>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="small" onClick={() => {}}>
                    刷新
                  </Button>
                </div>
              </div>

              <div className={styles.historyContent}>
                {verificationHistory.length > 0 ? (
                  <div className={styles.historyList}>
                    {verificationHistory.slice(0, 5).map(item => (
                      <div key={item.id} className={styles.historyItem}>
                        <div className={styles.historyItemMain}>
                          <div className={styles.historyTitle}>{item.studentName}</div>
                          <div className={styles.historyDescription}>
                            {item.university} • {item.semesterCount}个学期 • {item.courseCount}
                            门课程
                          </div>
                          <div className={styles.historyMeta}>
                            <span className={styles.historyTime}>
                              {new Date(item.verifiedAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span
                              className={classNames(styles.historyStatus, {
                                [styles.statusCompleted]: item.status === 'completed',
                                [styles.statusFailed]: item.status === 'failed',
                              })}
                            >
                              {item.status === 'completed' ? '成功' : '失败'}
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.historyEmpty}>
                    <Icon name="inbox" size="xl" variant="secondary" />
                    <p>暂无历史记录</p>
                    <p className={styles.emptyHint}>认证任务后会显示在这里</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Error display */}
        {(verificationError || uploadError) && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <Icon name="warning" variant="error" />
              <span>{verificationError || uploadError}</span>
            </div>
            <button
              className={styles.errorClose}
              onClick={() => {
                setVerificationError(null)
                setUploadError(null)
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
            <span>
              使用Google Gemini
              AI进行成绩单识别，支持双语和分开的中英文成绩单。每个信息字段均可单独复制。
            </span>
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}

export default Module2
