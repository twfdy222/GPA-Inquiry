import type {
  AppData,
  AppViewMode,
  Course,
  RiskCourse,
  Semester,
  SemesterSummary,
} from '../types/grade'
import { calculateCourse, calculateSummary } from './grade'

export function getActiveSemesters(semesters: Semester[]): Semester[] {
  return semesters
    .filter((semester) => !semester.archivedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export function getCurrentSemester(data: AppData): Semester | undefined {
  return (
    data.semesters.find((semester) => semester.id === data.currentSemesterId) ??
    getActiveSemesters(data.semesters)[0] ??
    data.semesters[0]
  )
}

export function getVisibleCourses(
  data: AppData,
  viewMode: AppViewMode,
): Course[] {
  const currentSemester = getCurrentSemester(data)

  return data.courses
    .filter((course) => !course.archivedAt)
    .filter((course) =>
      viewMode === 'all' || !currentSemester
        ? true
        : course.semesterId === currentSemester.id,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export function getSemesterSummaries(data: AppData): SemesterSummary[] {
  return getActiveSemesters(data.semesters).map((semester) => ({
    semesterId: semester.id,
    semesterName: semester.name,
    ...calculateSummary(
      data.courses.filter(
        (course) => !course.archivedAt && course.semesterId === semester.id,
      ),
      data.gpaRules,
    ),
  }))
}

export function getCreditDistribution(courses: Course[]) {
  const totals = courses.reduce(
    (sum, course) => {
      const key = course.kind ?? 'required'
      sum[key] += course.credits
      return sum
    },
    { required: 0, major: 0, elective: 0 },
  )

  const total = totals.required + totals.major + totals.elective

  return {
    ...totals,
    total,
  }
}

export function getRiskCourses(data: AppData, courses: Course[]): RiskCourse[] {
  return courses
    .map((course) => {
      const calculation = calculateCourse(course, data.gpaRules)
      const reasons: string[] = [...calculation.warnings]

      if (calculation.reverse.status === 'unreachable-high') {
        reasons.push('目标总评不可达')
      }

      if (calculation.reverse.status === 'ambiguous') {
        reasons.push('待反推项目超过一个')
      }

      if (calculation.reverse.status === 'needs-target') {
        reasons.push('待反推项目缺少目标总评')
      }

      if (course.targetScore !== undefined && calculation.projectedScore !== undefined) {
        if (calculation.projectedScore < course.targetScore) {
          reasons.push('预计总评低于目标')
        }
      }

      return { course, reasons }
    })
    .filter((item) => item.reasons.length > 0)
}
