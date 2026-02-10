/**
 * Module 2 store - Transcript Verification
 * Manages state for transcript verification functionality
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  TranscriptVerificationResult,
  TranscriptVerificationHistory,
  CourseInfo,
  Semester,
} from '../types/transcript.types'
import { apiClient } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

/**
 * Module 2 state interface for transcript verification
 */
export interface Module2State {
  // Verification state
  currentVerification: TranscriptVerificationResult | null
  verificationHistory: TranscriptVerificationHistory[]
  isVerifying: boolean
  verificationError: string | null

  // Upload state
  uploadType: 'single' | 'separate'
  files: {
    transcript?: File
    transcriptZh?: File
    transcriptEn?: File
  }
  isUploading: boolean
  uploadProgress: number
  uploadError: string | null

  // UI state
  selectedSemesterIndex: number
  selectedCourseIndex: number
  showRawData: boolean
  showConfidenceScores: boolean

  // Configuration
  verificationOptions: {
    preferredLanguage: 'zh' | 'en'
    includeGrades: boolean
    calculateGPA: boolean
    confidenceThreshold: number
    autoVerify: boolean
  }

  // Statistics
  verificationStats: {
    totalVerifications: number
    successfulVerifications: number
    averageConfidence: number
    averageProcessingTime: number
  }
}

/**
 * Module 2 actions interface
 */
export interface Module2Actions {
  // Upload actions
  setUploadType: (type: 'single' | 'separate') => void
  setFile: (fileKey: keyof Module2State['files'], file: File | null) => void
  clearFiles: () => void

  // Verification actions
  uploadAndVerify: () => Promise<TranscriptVerificationResult | null>
  verifyTranscript: (verificationId: string) => Promise<TranscriptVerificationResult | null>
  getVerification: (verificationId: string) => Promise<TranscriptVerificationResult | null>

  // UI actions
  setSelectedSemester: (index: number) => void
  setSelectedCourse: (semesterIndex: number, courseIndex: number) => void
  toggleRawData: () => void
  toggleConfidenceScores: () => void

  // Configuration actions
  updateVerificationOptions: (options: Partial<Module2State['verificationOptions']>) => void
  resetVerificationOptions: () => void

  // History actions
  addToHistory: (result: TranscriptVerificationResult) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void

  // Utility actions
  setVerifying: (isVerifying: boolean) => void
  setUploading: (isUploading: boolean) => void
  setUploadProgress: (progress: number) => void
  setVerificationError: (error: string | null) => void
  setUploadError: (error: string | null) => void
  reset: () => void

  // Copy actions
  copyToClipboard: (text: string) => Promise<void>
  copyCourseInfo: (course: CourseInfo) => Promise<void>
  copySemesterInfo: (semester: Semester) => Promise<void>
  copyStudentInfo: (studentInfo: TranscriptVerificationResult['student']) => Promise<void>
}

// Initial state
const initialState: Module2State = {
  currentVerification: null,
  verificationHistory: [],
  isVerifying: false,
  verificationError: null,

  uploadType: 'single',
  files: {},
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,

  selectedSemesterIndex: 0,
  selectedCourseIndex: 0,
  showRawData: false,
  showConfidenceScores: true,

  verificationOptions: {
    preferredLanguage: 'zh',
    includeGrades: true,
    calculateGPA: true,
    confidenceThreshold: 0.7,
    autoVerify: true,
  },

  verificationStats: {
    totalVerifications: 0,
    successfulVerifications: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
  },
}

/**
 * Create module 2 store
 */
export const useModule2Store = create<Module2State & Module2Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Upload actions
      setUploadType: type => set({ uploadType: type }),
      setFile: (fileKey, file) =>
        set(state => ({
          files: file
            ? { ...state.files, [fileKey]: file }
            : { ...state.files, [fileKey]: undefined },
        })),
      clearFiles: () => set({ files: {} }),

      // Verification actions
      uploadAndVerify: async () => {
        const { files, uploadType, verificationOptions } = get()
        set({ isUploading: true, uploadProgress: 0, uploadError: null })

        try {
          // Validate files based on upload type
          if (uploadType === 'single' && !files.transcript) {
            throw new Error('请选择成绩单文件')
          }
          if (uploadType === 'separate' && (!files.transcriptZh || !files.transcriptEn)) {
            throw new Error('请选择中文和英文成绩单文件')
          }

          // Create form data
          const formData = new FormData()
          formData.append('upload_type', uploadType)

          if (uploadType === 'single' && files.transcript) {
            formData.append('transcript', files.transcript)
          } else if (uploadType === 'separate') {
            if (files.transcriptZh) formData.append('transcript_zh', files.transcriptZh)
            if (files.transcriptEn) formData.append('transcript_en', files.transcriptEn)
          }

          // Simulate upload progress
          set({ uploadProgress: 30 })

          // Upload files
          const uploadResponse = await apiClient.post(
            ENDPOINTS.TRANSCRIPT_VERIFICATION.UPLOAD,
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

          const { verification_id } = uploadResponse.data
          set({ uploadProgress: 100, isUploading: false })

          // Auto-verify if enabled
          if (verificationOptions.autoVerify) {
            return await get().verifyTranscript(verification_id)
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

      verifyTranscript: async verificationId => {
        set({ isVerifying: true, verificationError: null })

        try {
          const response = await apiClient.post(
            ENDPOINTS.TRANSCRIPT_VERIFICATION.VERIFY(verificationId)
          )

          const verificationResult = response.data.verification_result
          const structuredResult = response.data.structured_result

          // Create verification result object
          const result: TranscriptVerificationResult = {
            ...verificationResult,
            metadata: {
              ...verificationResult.metadata,
              structured_result: structuredResult,
            },
          }

          // Add to history
          get().addToHistory(result)

          // Update statistics
          const { verificationStats } = get()
          const newTotal = verificationStats.totalVerifications + 1
          const newSuccessful = verificationStats.successfulVerifications + 1
          const newAvgConfidence =
            (verificationStats.averageConfidence * verificationStats.totalVerifications +
              (result.metadata?.overallConfidence || 0)) /
            newTotal

          set({
            currentVerification: result,
            isVerifying: false,
            verificationStats: {
              ...verificationStats,
              totalVerifications: newTotal,
              successfulVerifications: newSuccessful,
              averageConfidence: newAvgConfidence,
            },
          })

          return result
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '验证失败'
          set({ isVerifying: false, verificationError: errorMessage })
          console.error('Verification error:', error)
          throw error
        }
      },

      getVerification: async verificationId => {
        try {
          const response = await apiClient.get(
            ENDPOINTS.TRANSCRIPT_VERIFICATION.GET_VERIFICATION(verificationId)
          )

          const verificationData = response.data
          const result: TranscriptVerificationResult = {
            ...verificationData.verification_result,
            metadata: {
              ...verificationData.verification_result?.metadata,
              structured_result: verificationData.structured_result,
            },
          }

          set({ currentVerification: result })
          return result
        } catch (error: any) {
          console.error('Get verification error:', error)
          return null
        }
      },

      // UI actions
      setSelectedSemester: index => set({ selectedSemesterIndex: index }),
      setSelectedCourse: (semesterIndex, courseIndex) =>
        set({ selectedSemesterIndex: semesterIndex, selectedCourseIndex: courseIndex }),
      toggleRawData: () => set(state => ({ showRawData: !state.showRawData })),
      toggleConfidenceScores: () =>
        set(state => ({ showConfidenceScores: !state.showConfidenceScores })),

      // Configuration actions
      updateVerificationOptions: options =>
        set(state => ({
          verificationOptions: { ...state.verificationOptions, ...options },
        })),
      resetVerificationOptions: () =>
        set({ verificationOptions: initialState.verificationOptions }),

      // History actions
      addToHistory: result => {
        const historyItem: TranscriptVerificationHistory = {
          id: result.id,
          studentName: result.student.nameZh || result.student.nameEn || '未知学生',
          university: result.student.university || '未知院校',
          verifiedAt: result.metadata?.verifiedAt || new Date().toISOString(),
          semesterCount: result.semesters.length,
          courseCount: result.semesters.reduce((sum, semester) => sum + semester.courses.length, 0),
          confidence: result.metadata?.overallConfidence || 0,
          status: result.metadata?.status === 'completed' ? 'completed' : 'failed',
          preview: result.semesters[0]?.courses[0]?.nameZh || '无课程信息',
        }

        set(state => {
          const newHistory = [historyItem, ...state.verificationHistory.slice(0, 49)] // Keep last 50 items
          return {
            verificationHistory: newHistory,
            verificationStats: {
              ...state.verificationStats,
              totalVerifications: newHistory.length,
            },
          }
        })
      },

      clearHistory: () =>
        set({
          verificationHistory: [],
          verificationStats: { ...initialState.verificationStats, totalVerifications: 0 },
        }),

      removeFromHistory: id =>
        set(state => ({
          verificationHistory: state.verificationHistory.filter(item => item.id !== id),
        })),

      // Utility actions
      setVerifying: isVerifying => set({ isVerifying }),
      setUploading: isUploading => set({ isUploading }),
      setUploadProgress: progress => set({ uploadProgress: progress }),
      setVerificationError: error => set({ verificationError: error }),
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

      copyCourseInfo: async course => {
        const text = `课程名称: ${course.nameZh} (${course.nameEn})
课程类型: ${course.type.zh} (${course.type.en})
学分: ${course.credits}
${course.grade ? `成绩: ${course.grade}` : ''}
${course.gradePoints ? `绩点: ${course.gradePoints}` : ''}
${course.description ? `描述: ${course.description}` : ''}`

        return get().copyToClipboard(text)
      },

      copySemesterInfo: async semester => {
        const text = `学期: ${semester.nameZh} (${semester.nameEn})
学年: ${semester.academicYear}
学期类型: ${semester.type}
时间: ${semester.startDate || '未提供'} 至 ${semester.endDate || '未提供'}
总学分: ${semester.totalCredits}
${semester.semesterGPA ? `学期绩点: ${semester.semesterGPA}` : ''}
课程数量: ${semester.courses.length}`

        return get().copyToClipboard(text)
      },

      copyStudentInfo: async studentInfo => {
        const text = `学生信息:
中文姓名: ${studentInfo.nameZh}
英文姓名: ${studentInfo.nameEn}
学号: ${studentInfo.studentId}
院校: ${studentInfo.university}
专业: ${studentInfo.major}
学位级别: ${studentInfo.degreeLevel}
${studentInfo.graduationDate ? `预计毕业时间: ${studentInfo.graduationDate}` : ''}
${studentInfo.overallGPA ? `总平均绩点: ${studentInfo.overallGPA} / ${studentInfo.gpaScale}` : ''}`

        return get().copyToClipboard(text)
      },
    }),
    {
      name: 'module2-transcript-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Persist configuration and history
        verificationOptions: state.verificationOptions,
        verificationHistory: state.verificationHistory.slice(0, 20), // Keep only recent 20
        verificationStats: state.verificationStats,
        uploadType: state.uploadType,
      }),
    }
  )
)
