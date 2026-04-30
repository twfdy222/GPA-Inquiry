import type {
  AppData,
  AppVersion,
  Course,
  CourseKind,
  GpaRule,
  GradeItem,
} from '../types/grade'
import {
  APP_VERSION,
  LEGACY_STORAGE_KEYS,
  defaultData,
  defaultGpaRules,
  STORAGE_KEY,
} from './defaults'

const SUPPORTED_VERSIONS: AppVersion[] = ['1.0', '1.1']

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isCourseKind(value: unknown): value is CourseKind {
  return value === 'required' || value === 'major' || value === 'elective'
}

function isGradeItem(value: unknown): value is GradeItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<GradeItem>

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    isFiniteNumber(item.weight) &&
    (item.score === undefined || isFiniteNumber(item.score)) &&
    (item.isPending === undefined || typeof item.isPending === 'boolean')
  )
}

function normalizeGradeItem(item: GradeItem): GradeItem {
  return {
    ...item,
    isPending: Boolean(item.isPending),
  }
}

function isCourse(value: unknown): value is Course {
  if (!value || typeof value !== 'object') {
    return false
  }

  const course = value as Partial<Course>

  return (
    typeof course.id === 'string' &&
    typeof course.name === 'string' &&
    (course.kind === undefined || isCourseKind(course.kind)) &&
    isFiniteNumber(course.credits) &&
    (course.targetScore === undefined || isFiniteNumber(course.targetScore)) &&
    Array.isArray(course.items) &&
    course.items.every(isGradeItem)
  )
}

function normalizeCourse(course: Course): Course {
  return {
    ...course,
    kind: course.kind ?? 'required',
    items: course.items.map(normalizeGradeItem),
  }
}

function isGpaRule(value: unknown): value is GpaRule {
  if (!value || typeof value !== 'object') {
    return false
  }

  const rule = value as Partial<GpaRule>

  return (
    typeof rule.id === 'string' &&
    isFiniteNumber(rule.min) &&
    isFiniteNumber(rule.max) &&
    isFiniteNumber(rule.point)
  )
}

export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const data = value as Partial<AppData>

  return (
    SUPPORTED_VERSIONS.includes(data.version as AppVersion) &&
    Array.isArray(data.courses) &&
    Array.isArray(data.gpaRules) &&
    data.courses.every(isCourse) &&
    data.gpaRules.every(isGpaRule)
  )
}

function normalizeAppData(value: unknown): AppData | undefined {
  if (!isAppData(value)) {
    return undefined
  }

  return {
    version: APP_VERSION,
    courses: value.courses.map(normalizeCourse),
    gpaRules: value.gpaRules.map((rule) => ({ ...rule })),
  }
}

export function createDefaultData(): AppData {
  return {
    version: APP_VERSION,
    courses: [],
    gpaRules: defaultGpaRules.map((rule) => ({ ...rule })),
  }
}

export function loadAppData(): AppData {
  const storageKeys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]

  for (const storageKey of storageKeys) {
    try {
      const rawData = window.localStorage.getItem(storageKey)

      if (!rawData) {
        continue
      }

      const normalizedData = normalizeAppData(JSON.parse(rawData))

      if (normalizedData) {
        return normalizedData
      }
    } catch {
      continue
    }
  }

  return createDefaultData()
}

export function saveAppData(data: AppData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportAppData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `gpa-inquiry-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseImportedAppData(rawData: string): AppData {
  const normalizedData = normalizeAppData(JSON.parse(rawData))

  if (!normalizedData) {
    throw new Error('导入文件不是有效的 v1.0 / v1.1 数据。')
  }

  return normalizedData
}

export { defaultData }
