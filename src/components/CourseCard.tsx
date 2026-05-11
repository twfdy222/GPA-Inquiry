import { ChevronRight } from 'lucide-react'
import { courseKindDots, courseKindLabels, getCourseKind } from '../lib/courseKind'
import { formatNumber, formatScore } from '../lib/format'
import type { Course, CourseCalculation } from '../types/grade'

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
      className={`group grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition duration-200 ${
        selected
          ? 'border-brand-200 bg-[linear-gradient(135deg,rgba(222,239,255,0.96),rgba(255,255,255,0.98))] shadow-[0_20px_34px_rgba(37,99,235,0.10)] ring-1 ring-brand-100'
          : 'border-[rgba(191,211,238,0.72)] bg-white/72 hover:border-brand-100 hover:bg-white/88'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`size-3 shrink-0 rounded-full shadow-sm ${courseKindDots[kind]}`} />
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
          <span className="block text-base font-semibold text-brand-600">
            {formatScore(calculation.projectedScore)}
          </span>
          <span className="text-xs text-slate-500">预计总评</span>
        </span>
        <ChevronRight
          className={`size-4 text-slate-400 transition ${selected ? 'translate-x-0.5 text-brand-500' : 'group-hover:translate-x-0.5'}`}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}
