export type AppVersion = '1.0' | '1.1' | '2.0'
export type SchemaVersion = '2.0'
export type CourseKind = 'required' | 'major' | 'elective'

export type GradeItem = {
  id: string
  name: string
  weight: number
  score?: number
  isPending?: boolean
}

export type Semester = {
  id: string
  name: string
  year?: string
  term?: string
  archivedAt?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Course = {
  id: string
  semesterId: string
  name: string
  kind?: CourseKind
  credits: number
  targetScore?: number
  items: GradeItem[]
  archivedAt?: string
  sortOrder: number
  updatedAt: string
}

export type GpaRule = {
  id: string
  min: number
  max: number
  point: number
}

export type MigrationRecord = {
  from: AppVersion | 'empty'
  to: SchemaVersion
  migratedAt: string
  source: 'indexeddb' | 'localStorage' | 'import' | 'empty'
}

export type AppData = {
  version: AppVersion
  schemaVersion: SchemaVersion
  semesters: Semester[]
  currentSemesterId: string
  courses: Course[]
  gpaRules: GpaRule[]
  migration?: MigrationRecord
}

export type LegacyAppData = {
  version: '1.0' | '1.1'
  courses: Array<Omit<Course, 'semesterId' | 'sortOrder' | 'updatedAt'> & Partial<Course>>
  gpaRules: GpaRule[]
}

export type AppViewMode = 'current' | 'all'

export type WeightStatus = 'complete' | 'under' | 'over'

export type ReverseStatus =
  | 'none'
  | 'ok'
  | 'needs-target'
  | 'ambiguous'
  | 'zero-weight'
  | 'unreachable-high'
  | 'already-reached'

export type ReverseResult = {
  status: ReverseStatus
  itemId?: string
  itemName?: string
  requiredScore?: number
  message?: string
}

export type CourseCalculation = {
  courseId: string
  weightTotal: number
  weightStatus: WeightStatus
  knownContribution: number
  projectedScore?: number
  roundedScore?: number
  gpa?: number
  isComplete: boolean
  reverse: ReverseResult
  warnings: string[]
}

export type SummaryStats = {
  totalGpa?: number
  weightedAverage?: number
  totalCredits: number
  plannedCredits: number
  courseCount: number
  completeCourseCount: number
}

export type GpaRuleValidation = {
  isValid: boolean
  overlaps: string[]
  gaps: string[]
  warnings: string[]
}

export type SemesterSummary = SummaryStats & {
  semesterId: string
  semesterName: string
}

export type RiskCourse = {
  course: Course
  reasons: string[]
}
