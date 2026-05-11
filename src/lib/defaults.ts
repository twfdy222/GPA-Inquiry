import type { AppData, Course, GpaRule, GradeItem, Semester } from '../types/grade'

export const APP_VERSION = '2.0' as const
export const SCHEMA_VERSION = '2.0' as const
export const STORAGE_KEY = 'gpa-inquiry.v1.1'
export const LEGACY_STORAGE_KEYS = ['gpa-inquiry.v1.0'] as const
export const DB_NAME = 'gpa-inquiry-db'
export const DB_VERSION = 1
export const DB_STORE_NAME = 'app'
export const DB_DATA_KEY = 'current'
export const DEFAULT_SEMESTER_ID = 'semester-default'

export const defaultGpaRules: GpaRule[] = [
  { id: 'rule-95-100', min: 95, max: 100, point: 4.33 },
  { id: 'rule-90-95', min: 90, max: 95, point: 4.0 },
  { id: 'rule-85-90', min: 85, max: 90, point: 3.67 },
  { id: 'rule-82-85', min: 82, max: 85, point: 3.33 },
  { id: 'rule-78-82', min: 78, max: 82, point: 3.0 },
  { id: 'rule-75-78', min: 75, max: 78, point: 2.67 },
  { id: 'rule-72-75', min: 72, max: 75, point: 2.33 },
  { id: 'rule-68-72', min: 68, max: 72, point: 2.0 },
  { id: 'rule-64-68', min: 64, max: 68, point: 1.67 },
  { id: 'rule-61-64', min: 61, max: 64, point: 1.33 },
  { id: 'rule-60-61', min: 60, max: 61, point: 1.0 },
  { id: 'rule-0-60', min: 0, max: 60, point: 0.0 },
]

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function createSemester(name = '当前学期', sortOrder = 0): Semester {
  const timestamp = nowIso()

  return {
    id: createId('semester'),
    name,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createDefaultSemester(): Semester {
  const timestamp = nowIso()

  return {
    id: DEFAULT_SEMESTER_ID,
    name: '当前学期',
    sortOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createGradeItem(
  name = '',
  weight = 0,
  score?: number,
): GradeItem {
  return {
    id: createId('item'),
    name,
    weight,
    score,
    isPending: false,
  }
}

export function createCourse(
  semesterId = DEFAULT_SEMESTER_ID,
  sortOrder = Date.now(),
): Course {
  return {
    id: createId('course'),
    semesterId,
    name: '新课程',
    kind: 'required',
    credits: 3,
    targetScore: undefined,
    sortOrder,
    updatedAt: nowIso(),
    items: [
      createGradeItem('平时', 20),
      createGradeItem('期中', 30),
      createGradeItem('期末', 50),
    ],
  }
}

export function createDefaultData(): AppData {
  const semester = createDefaultSemester()

  return {
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    semesters: [semester],
    currentSemesterId: semester.id,
    courses: [],
    gpaRules: defaultGpaRules.map((rule) => ({ ...rule })),
    migration: {
      from: 'empty',
      to: SCHEMA_VERSION,
      migratedAt: nowIso(),
      source: 'empty',
    },
  }
}

export const defaultData: AppData = createDefaultData()
