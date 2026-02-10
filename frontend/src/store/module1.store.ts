/**
 * Module 1 store - Student Application Information Processing
 * Manages state for student application document analysis using Google GenAI
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

/**
 * Student Application Information Types
 */

export interface ApplicantInfo {
  name: string
  gender: string
  birth_date: string
  passport_number: string
  passport_issue_date: string
  passport_expiry_date: string
  phone: string
  email: string
  password: string
  domestic_address: string
  postal_code: string
}

export interface EducationBackground {
  university: string
  major: string
  study_period: {
    start_date: string
    end_date: string
  }
  expected_degree: string
  gpa: {
    score: string
    scale: string
  }
}

export interface LanguageTest {
  test_type: string
  test_date: string
  reference_number: string
  total_score: string
  sections: {
    listening: string
    reading: string
    writing: string
    speaking: string
  }
}

export interface WorkExperience {
  company_name: string
  company_address: string
  position: string
  work_period: {
    start_date: string
    end_date: string
  }
  job_description: string
}

export interface Recommender {
  name: string
  title: string
  relationship: string
  organization: string
  organization_address: string
  postal_code: string
  email: string
  phone: string
}

export interface StudentApplicationAnalysis {
  applicant_info: ApplicantInfo
  education_background: EducationBackground
  language_test: LanguageTest
  work_experience: WorkExperience[]
  recommenders: Recommender[]
  raw_response?: string
  error?: string
}

export interface StudentApplicationResult {
  id: string
  files: {
    transcript: { filename: string; filepath: string; content_type: string }
    degree_certificate: { filename: string; filepath: string; content_type: string }
    resume: { filename: string; filepath: string; content_type: string }
    ielts_score: { filename: string; filepath: string; content_type: string }
  }
  status: 'uploaded' | 'analyzed' | 'completed' | 'failed'
  analysis_result?: StudentApplicationAnalysis
  structured_summary?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface StudentApplicationHistory {
  id: string
  student_name: string
  university: string
  degree: string
  uploaded_at: string
  status: 'completed' | 'failed' | 'processing'
  preview: string
  file_count: number
}

/**
 * Module 1 state interface for student application processing
 */
export interface Module1State {
  // Current application state
  currentApplication: StudentApplicationResult | null
  applicationHistory: StudentApplicationHistory[]
  isProcessing: boolean
  processingError: string | null

  // File upload state
  files: {
    transcript?: File
    degree_certificate?: File
    resume?: File
    ielts_score?: File
  }
  isUploading: boolean
  uploadProgress: number
  uploadError: string | null

  // UI state
  showAdvancedOptions: boolean
  showRawAnalysis: boolean
  showTemplate: boolean
  selectedView: 'form' | 'result' | 'history'

  // Configuration
  processingOptions: {
    autoAnalyze: boolean
    generateSummary: boolean
    confidenceThreshold: number
    preferredLanguage: 'zh' | 'en'
  }

  // Statistics
  processingStats: {
    totalApplications: number
    successfulApplications: number
    averageProcessingTime: number
    averageConfidence: number
  }
}

/**
 * Module 1 actions interface
 */
export interface Module1Actions {
  // File upload actions
  setFile: (fileKey: keyof Module1State['files'], file: File | null) => void
  clearFiles: () => void

  // Application processing actions
  uploadAndAnalyze: () => Promise<StudentApplicationResult | null>
  analyzeApplication: (applicationId: string) => Promise<StudentApplicationResult | null>
  getApplication: (applicationId: string) => Promise<StudentApplicationResult | null>
  getTemplate: () => Promise<string>

  // UI actions
  setShowAdvancedOptions: (show: boolean) => void
  setShowRawAnalysis: (show: boolean) => void
  setShowTemplate: (show: boolean) => void
  setSelectedView: (view: Module1State['selectedView']) => void

  // Configuration actions
  updateProcessingOptions: (options: Partial<Module1State['processingOptions']>) => void
  resetProcessingOptions: () => void

  // History actions
  addToHistory: (result: StudentApplicationResult) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  refreshHistory: () => Promise<void>

  // Utility actions
  setProcessing: (isProcessing: boolean) => void
  setUploading: (isUploading: boolean) => void
  setUploadProgress: (progress: number) => void
  setProcessingError: (error: string | null) => void
  setUploadError: (error: string | null) => void
  reset: () => void

  // Copy actions
  copyToClipboard: (text: string) => Promise<void>
  copyApplicantInfo: (info: ApplicantInfo) => Promise<void>
  copyEducationInfo: (education: EducationBackground) => Promise<void>
  copyLanguageTestInfo: (languageTest: LanguageTest) => Promise<void>
  copyFullSummary: (summary: string) => Promise<void>
}

// Initial state
const initialState: Module1State = {
  // Current application state
  currentApplication: null,
  applicationHistory: [],
  isProcessing: false,
  processingError: null,

  // File upload state
  files: {},
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,

  // UI state
  showAdvancedOptions: false,
  showRawAnalysis: false,
  showTemplate: false,
  selectedView: 'form',

  // Configuration
  processingOptions: {
    autoAnalyze: true,
    generateSummary: true,
    confidenceThreshold: 0.7,
    preferredLanguage: 'zh',
  },

  // Statistics
  processingStats: {
    totalApplications: 0,
    successfulApplications: 0,
    averageProcessingTime: 0,
    averageConfidence: 0,
  },
}

/**
 * Create module 1 store
 */
export const useModule1Store = create<Module1State & Module1Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // File upload actions
      setFile: (fileKey, file) =>
        set(state => ({
          files: file
            ? { ...state.files, [fileKey]: file }
            : { ...state.files, [fileKey]: undefined },
        })),
      clearFiles: () => set({ files: {} }),

      // Application processing actions
      uploadAndAnalyze: async () => {
        const { files, processingOptions } = get()
        set({ isUploading: true, uploadProgress: 0, uploadError: null })

        try {
          // Validate all required files are present
          const requiredFiles = ['transcript', 'degree_certificate', 'resume', 'ielts_score']
          const missingFiles = requiredFiles.filter(fileKey => !files[fileKey as keyof typeof files])

          if (missingFiles.length > 0) {
            throw new Error(`请选择所有必需文件: ${missingFiles.join(', ')}`)
          }

          // Create form data
          const formData = new FormData()
          if (files.transcript) formData.append('transcript', files.transcript)
          if (files.degree_certificate) formData.append('degree_certificate', files.degree_certificate)
          if (files.resume) formData.append('resume', files.resume)
          if (files.ielts_score) formData.append('ielts_score', files.ielts_score)

          // Simulate upload progress
          set({ uploadProgress: 30 })

          // Upload files
          const uploadResponse = await apiClient.post(
            ENDPOINTS.STUDENT_APPLICATION.UPLOAD,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: progressEvent => {
                if (progressEvent.total) {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  set({ uploadProgress: 30 + progress * 0.7 }) // 30-100% for upload
                }
              },
            }
          )

          const { application_id } = uploadResponse.data
          set({ uploadProgress: 100, isUploading: false })

          // Auto-analyze if enabled
          if (processingOptions.autoAnalyze) {
            return await get().analyzeApplication(application_id)
          }

          return null
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '上传失败'
          set({
            isUploading: false,
            uploadError: errorMessage,
            uploadProgress: 0,
          })
          console.error('Upload error:', error)
          throw error
        }
      },

      analyzeApplication: async applicationId => {
        set({ isProcessing: true, processingError: null })

        try {
          const response = await apiClient.post(
            ENDPOINTS.STUDENT_APPLICATION.ANALYZE(applicationId)
          )

          const applicationData = response.data
          const result: StudentApplicationResult = {
            id: applicationId,
            files: applicationData.files || {},
            status: applicationData.status || 'completed',
            analysis_result: applicationData.analysis_result,
            structured_summary: applicationData.analysis_summary || applicationData.structured_summary,
            created_at: applicationData.created_at || new Date().toISOString(),
            updated_at: applicationData.updated_at || new Date().toISOString(),
          }

          // Add to history
          get().addToHistory(result)

          // Update statistics
          const { processingStats } = get()
          const newTotal = processingStats.totalApplications + 1
          const newSuccessful = processingStats.successfulApplications + 1

          set({
            currentApplication: result,
            isProcessing: false,
            processingStats: {
              ...processingStats,
              totalApplications: newTotal,
              successfulApplications: newSuccessful,
            },
          })

          return result
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '分析失败'
          set({ isProcessing: false, processingError: errorMessage })
          console.error('Analysis error:', error)
          throw error
        }
      },

      getApplication: async applicationId => {
        try {
          const response = await apiClient.get(
            ENDPOINTS.STUDENT_APPLICATION.GET_APPLICATION(applicationId)
          )

          const applicationData = response.data
          const result: StudentApplicationResult = {
            id: applicationId,
            files: applicationData.files || {},
            status: applicationData.status || 'unknown',
            analysis_result: applicationData.analysis_result,
            structured_summary: applicationData.structured_summary,
            error_message: applicationData.error_message,
            created_at: applicationData.created_at || new Date().toISOString(),
            updated_at: applicationData.updated_at || new Date().toISOString(),
          }

          set({ currentApplication: result })
          return result
        } catch (error: any) {
          console.error('Get application error:', error)
          return null
        }
      },

      getTemplate: async () => {
        try {
          const response = await apiClient.get(ENDPOINTS.STUDENT_APPLICATION.GET_TEMPLATE)
          return response.data.template || ''
        } catch (error: any) {
          console.error('Get template error:', error)
          return '无法加载模板，请检查网络连接'
        }
      },

      // UI actions
      setShowAdvancedOptions: show => set({ showAdvancedOptions: show }),
      setShowRawAnalysis: show => set({ showRawAnalysis: show }),
      setShowTemplate: show => set({ showTemplate: show }),
      setSelectedView: view => set({ selectedView: view }),

      // Configuration actions
      updateProcessingOptions: options =>
        set(state => ({
          processingOptions: { ...state.processingOptions, ...options },
        })),
      resetProcessingOptions: () =>
        set({ processingOptions: initialState.processingOptions }),

      // History actions
      addToHistory: result => {
        const historyItem: StudentApplicationHistory = {
          id: result.id,
          student_name: result.analysis_result?.applicant_info?.name || '未知申请人',
          university: result.analysis_result?.education_background?.university || '未知院校',
          degree: result.analysis_result?.education_background?.expected_degree || '未知学位',
          uploaded_at: result.created_at,
          status: result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'processing',
          preview: result.structured_summary?.substring(0, 100) || '无摘要信息',
          file_count: Object.keys(result.files || {}).length,
        }

        set(state => {
          const newHistory = [historyItem, ...state.applicationHistory.slice(0, 49)] // Keep last 50 items
          return {
            applicationHistory: newHistory,
            processingStats: {
              ...state.processingStats,
              totalApplications: newHistory.length,
            },
          }
        })
      },

      clearHistory: () =>
        set({
          applicationHistory: [],
          processingStats: { ...initialState.processingStats, totalApplications: 0 },
        }),

      removeFromHistory: id =>
        set(state => ({
          applicationHistory: state.applicationHistory.filter(item => item.id !== id),
        })),

      refreshHistory: async () => {
        try {
          const response = await apiClient.get(ENDPOINTS.STUDENT_APPLICATION.LIST)
          const applications = response.data.applications || []

          const historyItems: StudentApplicationHistory[] = applications.map((app: any) => ({
            id: app.id,
            student_name: app.analysis_result?.applicant_info?.name || '未知申请人',
            university: app.analysis_result?.education_background?.university || '未知院校',
            degree: app.analysis_result?.education_background?.expected_degree || '未知学位',
            uploaded_at: app.created_at || app.uploaded_at,
            status: app.status === 'completed' ? 'completed' : app.status === 'failed' ? 'failed' : 'processing',
            preview: app.structured_summary?.substring(0, 100) || '无摘要信息',
            file_count: Object.keys(app.files || {}).length,
          }))

          set({ applicationHistory: historyItems })
        } catch (error: any) {
          console.error('Refresh history error:', error)
        }
      },

      // Utility actions
      setProcessing: isProcessing => set({ isProcessing }),
      setUploading: isUploading => set({ isUploading }),
      setUploadProgress: progress => set({ uploadProgress: progress }),
      setProcessingError: error => set({ processingError: error }),
      setUploadError: error => set({ uploadError: error }),
      reset: () => set(initialState),

      // Copy actions
      copyToClipboard: async text => {
        try {
          await navigator.clipboard.writeText(text)
          return Promise.resolve()
        } catch (error) {
          console.error('Copy to clipboard failed:', error)
          return Promise.reject(error)
        }
      },

      copyApplicantInfo: async info => {
        const text = `申请人信息:
姓名: ${info.name}
性别: ${info.gender}
出生日期: ${info.birth_date}
护照号码: ${info.passport_number}
护照签发/过期: ${info.passport_issue_date} / ${info.passport_expiry_date}
联系电话: ${info.phone}
邮箱: ${info.email}
密码: ${info.password}
地址: ${info.domestic_address} (邮编: ${info.postal_code})`

        return get().copyToClipboard(text)
      },

      copyEducationInfo: async education => {
        const text = `教育背景:
院校: ${education.university}
专业: ${education.major}
就读时间: ${education.study_period.start_date} 至 ${education.study_period.end_date}
预计学位: ${education.expected_degree}
绩点 (GPA): ${education.gpa.score} / ${education.gpa.scale}`

        return get().copyToClipboard(text)
      },

      copyLanguageTestInfo: async languageTest => {
        const text = `语言成绩:
考试类型: ${languageTest.test_type}
考试日期: ${languageTest.test_date}
Reference Number: ${languageTest.reference_number}
总分: ${languageTest.total_score}
- 听力: ${languageTest.sections.listening}
- 阅读: ${languageTest.sections.reading}
- 写作: ${languageTest.sections.writing}
- 口语: ${languageTest.sections.speaking}`

        return get().copyToClipboard(text)
      },

      copyFullSummary: async summary => {
        return get().copyToClipboard(summary)
      },
    }),
    {
      name: 'module1-student-application-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Persist configuration and history
        processingOptions: state.processingOptions,
        applicationHistory: state.applicationHistory.slice(0, 20), // Keep only recent 20
        processingStats: state.processingStats,
        showAdvancedOptions: state.showAdvancedOptions,
        showRawAnalysis: state.showRawAnalysis,
        showTemplate: state.showTemplate,
        selectedView: state.selectedView,
      }),
    }
  )
)
