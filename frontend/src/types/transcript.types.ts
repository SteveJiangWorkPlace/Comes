/**
 * Transcript verification related TypeScript definitions
 */

/**
 * Course type classification
 */
export type CourseType =
  | 'core' // 核心课程
  | 'elective' // 选修课程
  | 'major' // 专业课程
  | 'general' // 通识课程
  | 'required' // 必修课程
  | 'optional' // 可选课程
  | 'practical' // 实践课程
  | 'thesis' // 论文/毕业设计
  | 'internship' // 实习课程
  | 'language' // 语言课程

/**
 * Course type with Chinese and English labels
 */
export interface CourseTypeInfo {
  /** English label for course type */
  en: string
  /** Chinese label for course type */
  zh: string
  /** Internal type identifier */
  type: CourseType
}

/**
 * Individual course information
 */
export interface CourseInfo {
  /** Course identifier */
  id?: string
  /** Course code (e.g., CS101) */
  code?: string
  /** Course name in Chinese */
  nameZh: string
  /** Course name in English */
  nameEn: string
  /** Course type information */
  type: CourseTypeInfo
  /** Credit hours/units */
  credits: number
  /** Grade (optional) */
  grade?: string
  /** Grade points (optional) */
  gradePoints?: number
  /** Course description (optional) */
  description?: string
  /** Whether this course is verified */
  verified?: boolean
  /** Verification confidence score (0-1) */
  confidence?: number
}

/**
 * Academic semester
 */
export interface Semester {
  /** Semester identifier */
  id?: string
  /** Semester name in Chinese (e.g., "第一学期", "上学期", "2023秋季") */
  nameZh: string
  /** Semester name in English (e.g., "Fall 2023", "Spring 2024") */
  nameEn: string
  /** Semester type: fall/autumn, spring, summer, winter */
  type: 'fall' | 'spring' | 'summer' | 'winter' | 'custom'
  /** Academic year (e.g., "2023-2024") */
  academicYear: string
  /** Start date (YYYY-MM-DD) */
  startDate?: string
  /** End date (YYYY-MM-DD) */
  endDate?: string
  /** List of courses in this semester */
  courses: CourseInfo[]
  /** Total credits for this semester */
  totalCredits: number
  /** Semester GPA (optional) */
  semesterGPA?: number
}

/**
 * Transcript verification result
 */
export interface TranscriptVerificationResult {
  /** Verification result ID */
  id: string
  /** Student information */
  student: {
    /** Student name in Chinese */
    nameZh: string
    /** Student name in English */
    nameEn: string
    /** Student ID */
    studentId: string
    /** University name */
    university: string
    /** Major/program */
    major: string
    /** Degree level (e.g., Bachelor, Master) */
    degreeLevel: string
    /** Expected graduation date */
    graduationDate?: string
    /** Overall GPA */
    overallGPA?: number
    /** GPA scale (e.g., 4.0, 100) */
    gpaScale: number
  }
  /** Academic semesters */
  semesters: Semester[]
  /** Total credits completed */
  totalCredits: number
  /** Overall academic standing */
  academicStanding?: string
  /** Verification metadata */
  metadata: {
    /** Source document type: single bilingual, separate Chinese, separate English */
    documentType: 'bilingual' | 'chinese' | 'english' | 'separate'
    /** Source filenames */
    sourceFiles: string[]
    /** Verification timestamp */
    verifiedAt: string
    /** AI model used for verification */
    modelUsed: string
    /** Overall confidence score (0-1) */
    overallConfidence: number
    /** Processing time in milliseconds */
    processingTime: number
    /** Verification status */
    status: 'pending' | 'processing' | 'completed' | 'failed'
    /** Error message if failed */
    error?: string
  }
}

/**
 * Transcript verification request
 */
export interface TranscriptVerificationRequest {
  /** Upload configuration */
  uploadType: 'single' | 'separate'
  /** Files to upload */
  files: {
    /** Single bilingual transcript file */
    transcript?: File
    /** Chinese transcript file (if separate) */
    transcriptZh?: File
    /** English transcript file (if separate) */
    transcriptEn?: File
  }
  /** Verification options */
  options?: {
    /** Preferred language for verification */
    preferredLanguage?: 'zh' | 'en'
    /** Course type mapping preferences */
    courseTypeMapping?: Record<string, CourseTypeInfo>
    /** Minimum confidence threshold (0-1) */
    confidenceThreshold?: number
    /** Whether to include grades in verification */
    includeGrades?: boolean
    /** Whether to calculate GPA */
    calculateGPA?: boolean
  }
}

/**
 * Transcript verification response
 */
export interface TranscriptVerificationResponse {
  /** Verification result */
  result: TranscriptVerificationResult
  /** Processing statistics */
  statistics: {
    /** Number of semesters identified */
    semestersCount: number
    /** Number of courses identified */
    coursesCount: number
    /** Average confidence score */
    averageConfidence: number
    /** Courses that need manual review */
    needsReview: CourseInfo[]
  }
  /** Verification summary */
  summary: string
}

/**
 * Course type mapping configuration
 */
export interface CourseTypeMapping {
  /** Pattern to match in course name/description */
  pattern: string
  /** Course type to assign */
  type: CourseTypeInfo
  /** Priority (higher = more specific) */
  priority: number
}

/**
 * Transcript verification history item
 */
export interface TranscriptVerificationHistory {
  /** History item ID */
  id: string
  /** Student name */
  studentName: string
  /** University */
  university: string
  /** Verification date */
  verifiedAt: string
  /** Number of semesters */
  semesterCount: number
  /** Number of courses */
  courseCount: number
  /** Overall confidence */
  confidence: number
  /** Verification status */
  status: 'completed' | 'failed' | 'pending'
  /** Result preview (first few courses) */
  preview: string
}
