export type AppVersion = '1.0'

export type GradeItem = {
  id: string
  name: string
  weight: number
  score?: number
  isPending?: boolean
}

export type Course = {
  id: string
  name: string
  credits: number
  targetScore?: number
  items: GradeItem[]
}

export type GpaRule = {
  id: string
  min: number
  max: number
  point: number
}

export type AppData = {
  version: AppVersion
  courses: Course[]
  gpaRules: GpaRule[]
}

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
  courseCount: number
  completeCourseCount: number
}

export type GpaRuleValidation = {
  isValid: boolean
  overlaps: string[]
  gaps: string[]
  warnings: string[]
}
