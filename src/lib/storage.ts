import type { AppData, Course, GpaRule, GradeItem } from '../types/grade'
import { APP_VERSION, defaultData, defaultGpaRules, STORAGE_KEY } from './defaults'

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
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

function isCourse(value: unknown): value is Course {
  if (!value || typeof value !== 'object') {
    return false
  }

  const course = value as Partial<Course>

  return (
    typeof course.id === 'string' &&
    typeof course.name === 'string' &&
    isFiniteNumber(course.credits) &&
    (course.targetScore === undefined || isFiniteNumber(course.targetScore)) &&
    Array.isArray(course.items) &&
    course.items.every(isGradeItem)
  )
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
    data.version === APP_VERSION &&
    Array.isArray(data.courses) &&
    Array.isArray(data.gpaRules) &&
    data.courses.every(isCourse) &&
    data.gpaRules.every(isGpaRule)
  )
}

export function createDefaultData(): AppData {
  return {
    version: APP_VERSION,
    courses: [],
    gpaRules: defaultGpaRules.map((rule) => ({ ...rule })),
  }
}

export function loadAppData(): AppData {
  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY)

    if (!rawData) {
      return createDefaultData()
    }

    const parsedData: unknown = JSON.parse(rawData)

    if (!isAppData(parsedData)) {
      return createDefaultData()
    }

    return parsedData
  } catch {
    return createDefaultData()
  }
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
  const parsedData: unknown = JSON.parse(rawData)

  if (!isAppData(parsedData)) {
    throw new Error('导入文件不是有效的 v1.0 数据。')
  }

  return parsedData
}

export { defaultData }
