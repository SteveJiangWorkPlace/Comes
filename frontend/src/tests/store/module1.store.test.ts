import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useModule1Store } from '../../store/module1.store'
import { apiClient } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { StudentApplicationResult, StudentApplicationAnalysis, ApplicantInfo, EducationBackground, LanguageTest } from '../../store/module1.store'

// Mock API client and endpoints
vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

vi.mock('../../api/endpoints', () => ({
  ENDPOINTS: {
    STUDENT_APPLICATION: {
      UPLOAD: '/api/student-applications/upload',
      ANALYZE: (id: string) => `/api/student-applications/analyze/${id}`,
      GET_APPLICATION: (id: string) => `/api/student-applications/${id}`,
      GET_TEMPLATE: '/api/student-applications/template',
      LIST: '/api/student-applications/'
    }
  }
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('Module 1 Store - Student Application Processing', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    localStorage.clear()

    // Reset store
    act(() => {
      useModule1Store.getState().reset()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useModule1Store())

      expect(result.current.currentApplication).toBeNull()
      expect(result.current.applicationHistory).toEqual([])
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.processingError).toBeNull()
      expect(result.current.files).toEqual({})
      expect(result.current.isUploading).toBe(false)
      expect(result.current.uploadProgress).toBe(0)
      expect(result.current.uploadError).toBeNull()
      expect(result.current.showAdvancedOptions).toBe(false)
      expect(result.current.showRawAnalysis).toBe(false)
      expect(result.current.showTemplate).toBe(false)
      expect(result.current.selectedView).toBe('form')
      expect(result.current.processingOptions).toEqual({
        autoAnalyze: true,
        generateSummary: true,
        confidenceThreshold: 0.7,
        preferredLanguage: 'zh'
      })
      expect(result.current.processingStats).toEqual({
        totalApplications: 0,
        successfulApplications: 0,
        averageProcessingTime: 0,
        averageConfidence: 0
      })
    })
  })

  describe('File Management Actions', () => {
    it('should set file', () => {
      const { result } = renderHook(() => useModule1Store())
      const testFile = new File(['test content'], 'transcript.pdf', { type: 'application/pdf' })

      act(() => {
        result.current.setFile('transcript', testFile)
      })

      expect(result.current.files.transcript).toBe(testFile)
    })

    it('should remove file when set to null', () => {
      const { result } = renderHook(() => useModule1Store())
      const testFile = new File(['test content'], 'transcript.pdf', { type: 'application/pdf' })

      // First set file
      act(() => {
        result.current.setFile('transcript', testFile)
      })
      expect(result.current.files.transcript).toBe(testFile)

      // Then remove it
      act(() => {
        result.current.setFile('transcript', null)
      })
      expect(result.current.files.transcript).toBeUndefined()
    })

    it('should clear all files', () => {
      const { result } = renderHook(() => useModule1Store())
      const testFile1 = new File(['test1'], 'transcript.pdf', { type: 'application/pdf' })
      const testFile2 = new File(['test2'], 'degree.pdf', { type: 'application/pdf' })

      act(() => {
        result.current.setFile('transcript', testFile1)
        result.current.setFile('degree_certificate', testFile2)
      })

      expect(result.current.files.transcript).toBe(testFile1)
      expect(result.current.files.degree_certificate).toBe(testFile2)

      act(() => {
        result.current.clearFiles()
      })

      expect(result.current.files).toEqual({})
    })
  })

  describe('Upload and Analyze Action', () => {
    it('should validate required files are present', async () => {
      const { result } = renderHook(() => useModule1Store())

      // Missing files
      await act(async () => {
        try {
          await result.current.uploadAndAnalyze()
        } catch (error: any) {
          expect(error.message).toContain('请选择所有必需文件')
        }
      })

      expect(result.current.uploadError).toContain('请选择所有必需文件')
    })

    it('should simulate successful upload and analysis', async () => {
      const { result } = renderHook(() => useModule1Store())

      // Set up mock files
      const mockFiles = {
        transcript: new File(['transcript'], 'transcript.pdf', { type: 'application/pdf' }),
        degree_certificate: new File(['degree'], 'degree.pdf', { type: 'application/pdf' }),
        resume: new File(['resume'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        ielts_score: new File(['ielts'], 'ielts.pdf', { type: 'application/pdf' })
      }

      act(() => {
        result.current.setFile('transcript', mockFiles.transcript)
        result.current.setFile('degree_certificate', mockFiles.degree_certificate)
        result.current.setFile('resume', mockFiles.resume)
        result.current.setFile('ielts_score', mockFiles.ielts_score)
      })

      // Mock API responses
      const mockUploadResponse = {
        data: {
          application_id: 'app-123',
          uploaded_files: {
            transcript: 'transcript.pdf',
            degree_certificate: 'degree.pdf',
            resume: 'resume.docx',
            ielts_score: 'ielts.pdf'
          }
        }
      }

      const mockAnalysisResponse = {
        data: {
          files: {
            transcript: { filename: 'transcript.pdf', filepath: '/uploads/transcript.pdf', content_type: 'application/pdf' },
            degree_certificate: { filename: 'degree.pdf', filepath: '/uploads/degree.pdf', content_type: 'application/pdf' },
            resume: { filename: 'resume.docx', filepath: '/uploads/resume.docx', content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            ielts_score: { filename: 'ielts.pdf', filepath: '/uploads/ielts.pdf', content_type: 'application/pdf' }
          },
          status: 'completed',
          analysis_result: {
            applicant_info: {
              name: '张三',
              gender: '男',
              birth_date: '2000-01-01',
              passport_number: 'E12345678',
              passport_issue_date: '2020-01-01',
              passport_expiry_date: '2030-01-01',
              phone: '+86 13800138000',
              email: 'zhangsan@example.com',
              password: 'password123',
              domestic_address: '北京市海淀区',
              postal_code: '100080'
            },
            education_background: {
              university: '清华大学',
              major: '计算机科学与技术',
              study_period: {
                start_date: '2018-09-01',
                end_date: '2022-06-30'
              },
              expected_degree: '学士',
              gpa: {
                score: '3.8',
                scale: '4.0'
              }
            },
            language_test: {
              test_type: '雅思',
              test_date: '2023-05-15',
              reference_number: 'IELTS123456',
              total_score: '7.5',
              sections: {
                listening: '8.0',
                reading: '7.5',
                writing: '7.0',
                speaking: '7.5'
              }
            },
            work_experience: [],
            recommenders: []
          },
          analysis_summary: '结构化摘要内容...'
        }
      }

      vi.mocked(apiClient.post)
        .mockResolvedValueOnce(mockUploadResponse) // Upload call
        .mockResolvedValueOnce(mockAnalysisResponse) // Analyze call

      // Execute upload and analyze
      await act(async () => {
        await result.current.uploadAndAnalyze()
      })

      // Check state updates
      expect(result.current.isUploading).toBe(false)
      expect(result.current.uploadProgress).toBe(100)
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.currentApplication).not.toBeNull()
      expect(result.current.currentApplication?.id).toBe('app-123')
      expect(result.current.currentApplication?.status).toBe('completed')
      expect(result.current.applicationHistory).toHaveLength(1)
      expect(result.current.processingStats.totalApplications).toBe(1)
      expect(result.current.processingStats.successfulApplications).toBe(1)
    })
  })

  describe('Analysis Actions', () => {
    it('should analyze existing application', async () => {
      const { result } = renderHook(() => useModule1Store())

      const mockAnalysisResponse = {
        data: {
          files: {},
          status: 'completed',
          analysis_result: {},
          structured_summary: 'Test summary'
        }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockAnalysisResponse)

      await act(async () => {
        await result.current.analyzeApplication('app-123')
      })

      expect(result.current.isProcessing).toBe(false)
      expect(result.current.currentApplication).not.toBeNull()
      expect(result.current.applicationHistory).toHaveLength(1)
    })

    it('should handle analysis error', async () => {
      const { result } = renderHook(() => useModule1Store())

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Analysis failed'))

      await act(async () => {
        try {
          await result.current.analyzeApplication('app-123')
        } catch (error) {
          // Expected
        }
      })

      expect(result.current.isProcessing).toBe(false)
      expect(result.current.processingError).toBe('分析失败')
    })
  })

  describe('History Management Actions', () => {
    it('should add result to history', () => {
      const { result } = renderHook(() => useModule1Store())

      const testResult: StudentApplicationResult = {
        id: 'test-123',
        files: {},
        status: 'completed',
        analysis_result: {
          applicant_info: {
            name: 'Test User',
            gender: '男',
            birth_date: '2000-01-01',
            passport_number: 'E12345678',
            passport_issue_date: '2020-01-01',
            passport_expiry_date: '2030-01-01',
            phone: '+86 13800138000',
            email: 'test@example.com',
            password: 'password123',
            domestic_address: 'Test Address',
            postal_code: '100000'
          },
          education_background: {
            university: 'Test University',
            major: 'Test Major',
            study_period: {
              start_date: '2018-09-01',
              end_date: '2022-06-30'
            },
            expected_degree: '学士',
            gpa: {
              score: '3.5',
              scale: '4.0'
            }
          },
          language_test: {
            test_type: '雅思',
            test_date: '2023-05-15',
            reference_number: 'TEST123',
            total_score: '7.0',
            sections: {
              listening: '7.5',
              reading: '7.0',
              writing: '6.5',
              speaking: '7.0'
            }
          },
          work_experience: [],
          recommenders: []
        },
        structured_summary: 'Test summary',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      act(() => {
        result.current.addToHistory(testResult)
      })

      expect(result.current.applicationHistory).toHaveLength(1)
      expect(result.current.applicationHistory[0].id).toBe('test-123')
      expect(result.current.applicationHistory[0].student_name).toBe('Test User')
      expect(result.current.applicationHistory[0].university).toBe('Test University')
      expect(result.current.applicationHistory[0].status).toBe('completed')
    })

    it('should clear history', () => {
      const { result } = renderHook(() => useModule1Store())

      // Add some history first
      const testResult: StudentApplicationResult = {
        id: 'test-123',
        files: {},
        status: 'completed',
        analysis_result: {
          applicant_info: {
            name: 'Test User',
            gender: '男',
            birth_date: '2000-01-01',
            passport_number: 'E12345678',
            passport_issue_date: '2020-01-01',
            passport_expiry_date: '2030-01-01',
            phone: '+86 13800138000',
            email: 'test@example.com',
            password: 'password123',
            domestic_address: 'Test Address',
            postal_code: '100000'
          },
          education_background: {
            university: 'Test University',
            major: 'Test Major',
            study_period: {
              start_date: '2018-09-01',
              end_date: '2022-06-30'
            },
            expected_degree: '学士',
            gpa: {
              score: '3.5',
              scale: '4.0'
            }
          },
          language_test: {
            test_type: '雅思',
            test_date: '2023-05-15',
            reference_number: 'TEST123',
            total_score: '7.0',
            sections: {
              listening: '7.5',
              reading: '7.0',
              writing: '6.5',
              speaking: '7.0'
            }
          },
          work_experience: [],
          recommenders: []
        },
        structured_summary: 'Test summary',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      act(() => {
        result.current.addToHistory(testResult)
      })
      expect(result.current.applicationHistory).toHaveLength(1)

      // Clear history
      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.applicationHistory).toEqual([])
      expect(result.current.processingStats.totalApplications).toBe(0)
    })

    it('should remove specific item from history', () => {
      const { result } = renderHook(() => useModule1Store())

      // Add multiple items
      const testResult1: StudentApplicationResult = {
        id: 'test-1',
        files: {},
        status: 'completed',
        analysis_result: {
          applicant_info: {
            name: 'User 1',
            gender: '男',
            birth_date: '2000-01-01',
            passport_number: 'E12345678',
            passport_issue_date: '2020-01-01',
            passport_expiry_date: '2030-01-01',
            phone: '+86 13800138000',
            email: 'test1@example.com',
            password: 'password123',
            domestic_address: 'Address 1',
            postal_code: '100000'
          },
          education_background: {
            university: 'University 1',
            major: 'Major 1',
            study_period: {
              start_date: '2018-09-01',
              end_date: '2022-06-30'
            },
            expected_degree: '学士',
            gpa: {
              score: '3.5',
              scale: '4.0'
            }
          },
          language_test: {
            test_type: '雅思',
            test_date: '2023-05-15',
            reference_number: 'TEST1',
            total_score: '7.0',
            sections: {
              listening: '7.5',
              reading: '7.0',
              writing: '6.5',
              speaking: '7.0'
            }
          },
          work_experience: [],
          recommenders: []
        },
        structured_summary: 'Summary 1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const testResult2: StudentApplicationResult = {
        id: 'test-2',
        files: {},
        status: 'completed',
        analysis_result: {
          applicant_info: {
            name: 'User 2',
            gender: '女',
            birth_date: '2001-01-01',
            passport_number: 'E87654321',
            passport_issue_date: '2021-01-01',
            passport_expiry_date: '2031-01-01',
            phone: '+86 13900139000',
            email: 'test2@example.com',
            password: 'password456',
            domestic_address: 'Address 2',
            postal_code: '200000'
          },
          education_background: {
            university: 'University 2',
            major: 'Major 2',
            study_period: {
              start_date: '2019-09-01',
              end_date: '2023-06-30'
            },
            expected_degree: '硕士',
            gpa: {
              score: '3.8',
              scale: '4.0'
            }
          },
          language_test: {
            test_type: '托福',
            test_date: '2023-06-15',
            reference_number: 'TEST2',
            total_score: '105',
            sections: {
              listening: '26',
              reading: '28',
              writing: '24',
              speaking: '27'
            }
          },
          work_experience: [],
          recommenders: []
        },
        structured_summary: 'Summary 2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      act(() => {
        result.current.addToHistory(testResult1)
        result.current.addToHistory(testResult2)
      })
      expect(result.current.applicationHistory).toHaveLength(2)

      // Remove first item
      act(() => {
        result.current.removeFromHistory('test-1')
      })

      expect(result.current.applicationHistory).toHaveLength(1)
      expect(result.current.applicationHistory[0].id).toBe('test-2')
      expect(result.current.applicationHistory[0].student_name).toBe('User 2')
    })
  })

  describe('UI Actions', () => {
    it('should update UI state', () => {
      const { result } = renderHook(() => useModule1Store())

      act(() => {
        result.current.setShowAdvancedOptions(true)
      })
      expect(result.current.showAdvancedOptions).toBe(true)

      act(() => {
        result.current.setShowRawAnalysis(true)
      })
      expect(result.current.showRawAnalysis).toBe(true)

      act(() => {
        result.current.setShowTemplate(true)
      })
      expect(result.current.showTemplate).toBe(true)

      act(() => {
        result.current.setSelectedView('result')
      })
      expect(result.current.selectedView).toBe('result')
    })
  })

  describe('Configuration Actions', () => {
    it('should update processing options', () => {
      const { result } = renderHook(() => useModule1Store())

      const newOptions = {
        autoAnalyze: false,
        confidenceThreshold: 0.8,
        preferredLanguage: 'en'
      }

      act(() => {
        result.current.updateProcessingOptions(newOptions)
      })

      expect(result.current.processingOptions).toEqual({
        autoAnalyze: false,
        generateSummary: true, // Should preserve existing value
        confidenceThreshold: 0.8,
        preferredLanguage: 'en'
      })
    })

    it('should reset processing options to initial state', () => {
      const { result } = renderHook(() => useModule1Store())

      // First change options
      act(() => {
        result.current.updateProcessingOptions({
          autoAnalyze: false,
          confidenceThreshold: 0.9,
          preferredLanguage: 'en'
        })
      })

      expect(result.current.processingOptions.autoAnalyze).toBe(false)
      expect(result.current.processingOptions.confidenceThreshold).toBe(0.9)

      // Then reset
      act(() => {
        result.current.resetProcessingOptions()
      })

      expect(result.current.processingOptions).toEqual({
        autoAnalyze: true,
        generateSummary: true,
        confidenceThreshold: 0.7,
        preferredLanguage: 'zh'
      })
    })
  })

  describe('Copy Actions', () => {
    it('should copy text to clipboard', async () => {
      const { result } = renderHook(() => useModule1Store())

      const testText = 'Test text to copy'

      await act(async () => {
        await result.current.copyToClipboard(testText)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText)
    })

    it('should copy applicant info to clipboard', async () => {
      const { result } = renderHook(() => useModule1Store())

      const applicantInfo: ApplicantInfo = {
        name: '张三',
        gender: '男',
        birth_date: '2000-01-01',
        passport_number: 'E12345678',
        passport_issue_date: '2020-01-01',
        passport_expiry_date: '2030-01-01',
        phone: '+86 13800138000',
        email: 'zhangsan@example.com',
        password: 'password123',
        domestic_address: '北京市海淀区',
        postal_code: '100080'
      }

      await act(async () => {
        await result.current.copyApplicantInfo(applicantInfo)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      const copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]
      expect(copiedText).toContain('张三')
      expect(copiedText).toContain('E12345678')
      expect(copiedText).toContain('北京市海淀区')
    })
  })

  describe('Utility Actions', () => {
    it('should set processing state', () => {
      const { result } = renderHook(() => useModule1Store())

      act(() => {
        result.current.setProcessing(true)
      })
      expect(result.current.isProcessing).toBe(true)

      act(() => {
        result.current.setProcessing(false)
      })
      expect(result.current.isProcessing).toBe(false)
    })

    it('should set uploading state', () => {
      const { result } = renderHook(() => useModule1Store())

      act(() => {
        result.current.setUploading(true)
      })
      expect(result.current.isUploading).toBe(true)
    })

    it('should set upload progress', () => {
      const { result } = renderHook(() => useModule1Store())

      act(() => {
        result.current.setUploadProgress(50)
      })
      expect(result.current.uploadProgress).toBe(50)
    })

    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useModule1Store())

      // Change some state
      act(() => {
        result.current.setShowAdvancedOptions(true)
        result.current.setSelectedView('history')
        result.current.updateProcessingOptions({ autoAnalyze: false })
      })

      expect(result.current.showAdvancedOptions).toBe(true)
      expect(result.current.selectedView).toBe('history')
      expect(result.current.processingOptions.autoAnalyze).toBe(false)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.showAdvancedOptions).toBe(false)
      expect(result.current.selectedView).toBe('form')
      expect(result.current.processingOptions.autoAnalyze).toBe(true)
    })
  })
})