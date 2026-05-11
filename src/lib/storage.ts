import type {
  AppData,
  AppVersion,
  Course,
  CourseKind,
  GpaRule,
  GradeItem,
  LegacyAppData,
  Semester,
} from '../types/grade'
import {
  APP_VERSION,
  DB_DATA_KEY,
  DB_NAME,
  DB_STORE_NAME,
  DB_VERSION,
  DEFAULT_SEMESTER_ID,
  LEGACY_STORAGE_KEYS,
  SCHEMA_VERSION,
  STORAGE_KEY,
  createDefaultData,
  defaultGpaRules,
  nowIso,
} from './defaults'

const SUPPORTED_LEGACY_VERSIONS: AppVersion[] = ['1.0', '1.1']
const SUPPORTED_CURRENT_VERSIONS: AppVersion[] = ['2.0', '2.1']

type StoredRecord = {
  id: string
  data: AppData
}

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

function isSemester(value: unknown): value is Semester {
  if (!value || typeof value !== 'object') {
    return false
  }

  const semester = value as Partial<Semester>

  return (
    typeof semester.id === 'string' &&
    typeof semester.name === 'string' &&
    isFiniteNumber(semester.sortOrder) &&
    typeof semester.createdAt === 'string' &&
    typeof semester.updatedAt === 'string' &&
    (semester.archivedAt === undefined || typeof semester.archivedAt === 'string')
  )
}

function isCourse(value: unknown): value is Course {
  if (!value || typeof value !== 'object') {
    return false
  }

  const course = value as Partial<Course>

  return (
    typeof course.id === 'string' &&
    typeof course.semesterId === 'string' &&
    typeof course.name === 'string' &&
    (course.kind === undefined || isCourseKind(course.kind)) &&
    isFiniteNumber(course.credits) &&
    (course.targetScore === undefined || isFiniteNumber(course.targetScore)) &&
    Array.isArray(course.items) &&
    course.items.every(isGradeItem) &&
    isFiniteNumber(course.sortOrder) &&
    typeof course.updatedAt === 'string' &&
    (course.archivedAt === undefined || typeof course.archivedAt === 'string')
  )
}

function isLegacyCourse(value: unknown): value is LegacyAppData['courses'][number] {
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

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const data = value as Partial<AppData>

  return (
    SUPPORTED_CURRENT_VERSIONS.includes(data.version as AppVersion) &&
    data.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(data.semesters) &&
    data.semesters.every(isSemester) &&
    typeof data.currentSemesterId === 'string' &&
    Array.isArray(data.courses) &&
    data.courses.every(isCourse) &&
    Array.isArray(data.gpaRules) &&
    data.gpaRules.every(isGpaRule)
  )
}

function isLegacyAppData(value: unknown): value is LegacyAppData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const data = value as Partial<LegacyAppData>

  return (
    SUPPORTED_LEGACY_VERSIONS.includes(data.version as AppVersion) &&
    Array.isArray(data.courses) &&
    data.courses.every(isLegacyCourse) &&
    Array.isArray(data.gpaRules) &&
    data.gpaRules.every(isGpaRule)
  )
}

function normalizeCourse(course: Course): Course {
  return {
    ...course,
    kind: course.kind ?? 'required',
    items: course.items.map(normalizeGradeItem),
  }
}

function normalizeAppData(value: unknown): AppData | undefined {
  if (!isAppData(value)) {
    return undefined
  }

  return {
    ...value,
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    semesters: value.semesters.map((semester) => ({ ...semester })),
    courses: value.courses.map(normalizeCourse),
    gpaRules: value.gpaRules.map((rule) => ({ ...rule })),
  }
}

function migrateLegacyData(
  legacyData: LegacyAppData,
  source: 'localStorage' | 'import',
): AppData {
  const timestamp = nowIso()
  const defaultSemester: Semester = {
    id: DEFAULT_SEMESTER_ID,
    name: legacyData.courses.length > 0 ? '导入自旧版本' : '当前学期',
    sortOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  return {
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    semesters: [defaultSemester],
    currentSemesterId: defaultSemester.id,
    courses: legacyData.courses.map((course, index) => ({
      ...course,
      semesterId: course.semesterId ?? defaultSemester.id,
      kind: course.kind ?? 'required',
      items: course.items.map(normalizeGradeItem),
      sortOrder: course.sortOrder ?? index,
      updatedAt: course.updatedAt ?? timestamp,
    })),
    gpaRules: legacyData.gpaRules.map((rule) => ({ ...rule })),
    migration: {
      from: legacyData.version,
      to: SCHEMA_VERSION,
      migratedAt: timestamp,
      source,
    },
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(DB_STORE_NAME)) {
        database.createObjectStore(DB_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readIndexedDbData(): Promise<AppData | undefined> {
  if (!('indexedDB' in window)) {
    return undefined
  }

  const database = await openDatabase()

  return new Promise<AppData | undefined>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE_NAME, 'readonly')
    const store = transaction.objectStore(DB_STORE_NAME)
    const request = store.get(DB_DATA_KEY)

    request.onsuccess = () => {
      const record = request.result as StoredRecord | undefined
      resolve(normalizeAppData(record?.data))
    }
    request.onerror = () => reject(request.error)
  }).finally(() => database.close())
}

async function writeIndexedDbData(data: AppData): Promise<void> {
  if (!('indexedDB' in window)) {
    return
  }

  const database = await openDatabase()

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(DB_STORE_NAME)
    const request = store.put({ id: DB_DATA_KEY, data } satisfies StoredRecord)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  }).finally(() => database.close())
}

function readLegacyLocalStorage(): AppData | undefined {
  let currentData: AppData | undefined
  let legacyData: AppData | undefined

  for (const storageKey of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    try {
      const rawData = window.localStorage.getItem(storageKey)

      if (!rawData) {
        continue
      }

      const parsedData: unknown = JSON.parse(rawData)
      const normalizedV2 = normalizeAppData(parsedData)
      const migratedData = isLegacyAppData(parsedData)
        ? migrateLegacyData(parsedData, 'localStorage')
        : undefined
      const normalizedData = normalizedV2 ?? migratedData

      if (!normalizedData) {
        continue
      }

      if (storageKey === STORAGE_KEY) {
        currentData = normalizedData
      } else if (!legacyData) {
        legacyData = normalizedData
      }
    } catch {
      continue
    }
  }

  if (
    currentData &&
    currentData.courses.length === 0 &&
    legacyData &&
    legacyData.courses.length > 0
  ) {
    return legacyData
  }

  return currentData ?? legacyData
}

export async function loadAppData(): Promise<AppData> {
  const indexedDbData = await readIndexedDbData()

  if (indexedDbData) {
    return indexedDbData
  }

  const legacyData = readLegacyLocalStorage()

  if (legacyData) {
    await writeIndexedDbData(legacyData)
    return legacyData
  }

  const defaultData = createDefaultData()
  await writeIndexedDbData(defaultData)
  return defaultData
}

export async function saveAppData(data: AppData): Promise<void> {
  await writeIndexedDbData({
    ...data,
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
  })
}

export function exportAppData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `gpa-inquiry-v2.1-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseImportedAppData(rawData: string): AppData {
  const parsedData: unknown = JSON.parse(rawData)
  const normalizedData = normalizeAppData(parsedData)

  if (normalizedData) {
    return normalizedData
  }

  if (isLegacyAppData(parsedData)) {
    return migrateLegacyData(parsedData, 'import')
  }

  throw new Error('导入文件不是有效的 v1.0 / v1.1 / v2.0 / v2.1 数据。')
}

export { defaultGpaRules }
