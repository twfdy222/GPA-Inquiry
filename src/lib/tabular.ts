import type { AppData, Course, CourseKind, GradeItem } from '../types/grade'
import { courseKindLabels } from './courseKind'
import { createId, nowIso } from './defaults'

export type TabularCourseRow = {
  学期: string
  课程名: string
  课程类型: string
  学分: number
  目标总评: number | ''
  成绩项: string
  权重: number
  分数: number | ''
  待反推: string
}

export type ImportPreview = {
  courses: Course[]
  errors: string[]
  rowCount: number
}

const headers = ['学期', '课程名', '课程类型', '学分', '目标总评', '成绩项', '权重', '分数', '待反推'] as const

const kindByLabel: Record<string, CourseKind> = {
  必修课: 'required',
  专业课: 'major',
  选修课: 'elective',
  required: 'required',
  major: 'major',
  elective: 'elective',
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : undefined
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === '是' || value === '1'
}

function escapeCsvValue(value: unknown): string {
  const text = String(value ?? '')

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function createTabularRows(data: AppData, courses = data.courses): TabularCourseRow[] {
  const semesterById = new Map(
    data.semesters.map((semester) => [semester.id, semester.name]),
  )

  return courses.flatMap((course) => {
    const rows: Array<Pick<GradeItem, 'name' | 'weight' | 'score' | 'isPending'>> =
      course.items.length > 0
        ? course.items
        : [{ name: '', weight: 0, score: undefined, isPending: false }]

    return rows.map((item) => ({
      学期: semesterById.get(course.semesterId) ?? '当前学期',
      课程名: course.name,
      课程类型: courseKindLabels[course.kind ?? 'required'],
      学分: course.credits,
      目标总评: course.targetScore ?? '',
      成绩项: item.name,
      权重: item.weight,
      分数: item.score ?? '',
      待反推: item.isPending ? '是' : '否',
    }))
  })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportCsv(data: AppData, courses = data.courses): void {
  const rows = createTabularRows(data, courses)
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ]

  downloadBlob(
    new Blob([`\ufeff${csvRows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }),
    `gpa-inquiry-v2.1-courses-${new Date().toISOString().slice(0, 10)}.csv`,
  )
}

export async function exportXlsx(data: AppData, courses = data.courses): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const rows = createTabularRows(data, courses)
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('课程成绩')

  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: header === '课程名' ? 24 : 14,
  }))
  worksheet.addRows(rows)
  worksheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `gpa-inquiry-v2.1-courses-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}

async function readRowsFromFile(file: File): Promise<TabularCourseRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    const rows = text
      .replace(/^\ufeff/, '')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.split(',').map((cell) => cell.trim()))
    const [headerRow, ...dataRows] = rows

    return dataRows.map((row) => {
      const record = {} as Record<(typeof headers)[number], string>
      headers.forEach((header, index) => {
        const columnIndex = headerRow?.indexOf(header) ?? -1
        record[header] = row[columnIndex >= 0 ? columnIndex : index] ?? ''
      })
      return record as unknown as TabularCourseRow
    })
  }

  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const worksheet = workbook.worksheets[0]

  if (!worksheet) {
    return []
  }

  const headerRow = worksheet.getRow(1).values as Array<string | undefined>
  const columnByHeader = new Map<string, number>()
  headerRow.forEach((value, index) => {
    if (typeof value === 'string') {
      columnByHeader.set(value.trim(), index)
    }
  })

  const rows: TabularCourseRow[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }

    const record = {} as Record<(typeof headers)[number], unknown>
    headers.forEach((header, index) => {
      const columnIndex = columnByHeader.get(header) ?? index + 1
      record[header] = row.getCell(columnIndex).value ?? ''
    })
    rows.push(record as TabularCourseRow)
  })

  return rows
}

export async function previewTabularImport(
  file: File,
  semesterNameToId: Map<string, string>,
  fallbackSemesterId: string,
): Promise<ImportPreview> {
  const rows = await readRowsFromFile(file)
  const errors: string[] = []
  const groupedCourses = new Map<string, Course>()
  const timestamp = nowIso()

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const courseName = String(row.课程名 ?? '').trim()
    const itemName = String(row.成绩项 ?? '').trim()
    const credits = parseNumber(row.学分)
    const weight = parseNumber(row.权重)
    const score = parseNumber(row.分数)
    const targetScore = parseNumber(row.目标总评)
    const kind = kindByLabel[String(row.课程类型 ?? '').trim()] ?? 'required'
    const semesterName = String(row.学期 ?? '').trim()
    const semesterId = semesterNameToId.get(semesterName) ?? fallbackSemesterId

    if (!courseName) {
      errors.push(`第 ${rowNumber} 行缺少课程名。`)
    }

    if (!itemName) {
      errors.push(`第 ${rowNumber} 行缺少成绩项。`)
    }

    if (credits === undefined || credits < 0) {
      errors.push(`第 ${rowNumber} 行学分无效。`)
    }

    if (weight === undefined || weight < 0 || weight > 100) {
      errors.push(`第 ${rowNumber} 行权重无效。`)
    }

    if (score !== undefined && (score < 0 || score > 100)) {
      errors.push(`第 ${rowNumber} 行分数无效。`)
    }

    if (targetScore !== undefined && (targetScore < 0 || targetScore > 100)) {
      errors.push(`第 ${rowNumber} 行目标总评无效。`)
    }

    if (!courseName || !itemName || credits === undefined || weight === undefined) {
      return
    }

    const key = `${semesterId}::${courseName}`
    const item: GradeItem = {
      id: createId('item'),
      name: itemName,
      weight,
      score,
      isPending: normalizeBoolean(row.待反推),
    }

    if (!groupedCourses.has(key)) {
      groupedCourses.set(key, {
        id: createId('course'),
        semesterId,
        name: courseName,
        kind,
        credits,
        targetScore,
        items: [item],
        sortOrder: Date.now() + index,
        updatedAt: timestamp,
      })
      return
    }

    groupedCourses.get(key)?.items.push(item)
  })

  return {
    courses: [...groupedCourses.values()],
    errors,
    rowCount: rows.length,
  }
}
