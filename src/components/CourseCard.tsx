import { ChevronRight } from 'lucide-react'
import type { Course, CourseCalculation } from '../types/grade'
import { courseKindDots, courseKindLabels, getCourseKind } from '../lib/courseKind'
import { formatNumber, formatScore } from '../lib/format'

type CourseCardProps = {
  course: Course
  calculation: CourseCalculation
  selected: boolean
  onSelect: () => void
}

export function CourseCard({
  course,
  calculation,
  selected,
  onSelect,
}: CourseCardProps) {
  const kind = getCourseKind(course.kind)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-sm ring-2 ring-brand-100'
          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`size-2.5 shrink-0 rounded-full ${courseKindDots[kind]}`} />
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-slate-900">
            {course.name || '未命名课程'}
          </span>
          <span className="mt-1 block text-sm text-slate-500">
            {courseKindLabels[kind]} · {formatNumber(course.credits, 1)} 学分
          </span>
        </span>
      </span>
      <span className="flex items-center gap-3">
        <span className="text-right">
          <span className="block text-base font-bold text-brand-600">
            {formatScore(calculation.projectedScore)}
          </span>
          <span className="text-xs text-slate-500">分</span>
        </span>
        <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
      </span>
    </button>
  )
}
