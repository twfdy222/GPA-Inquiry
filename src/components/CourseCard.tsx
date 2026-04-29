import type { Course, CourseCalculation } from '../types/grade'
import { formatNumber, formatScore } from '../lib/format'
import { Button, Notice } from './ui'

type CourseCardProps = {
  course: Course
  calculation: CourseCalculation
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function CourseCard({
  course,
  calculation,
  selected,
  onSelect,
  onDelete,
}: CourseCardProps) {
  const reverse = calculation.reverse

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-soft transition ${
        selected ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{course.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatNumber(course.credits, 1)} 学分 · 占比合计{' '}
            {formatNumber(calculation.weightTotal, 1)}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={selected ? 'primary' : 'secondary'} onClick={onSelect}>
            {selected ? '编辑中' : '编辑'}
          </Button>
          <Button variant="ghost" onClick={onDelete}>
            删除
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="当前已知贡献分" value={formatScore(calculation.knownContribution)} />
        <Metric label="预计总评" value={formatScore(calculation.projectedScore)} />
        <Metric label="绩点" value={formatNumber(calculation.gpa, 2)} />
      </div>

      {course.targetScore !== undefined && (
        <p className="mt-3 text-sm text-slate-500">
          目标总评：{formatScore(course.targetScore)}
        </p>
      )}

      <div className="mt-4 grid gap-2">
        {calculation.warnings.map((warning) => (
          <Notice
            key={warning}
            tone={calculation.weightStatus === 'over' ? 'danger' : 'warning'}
          >
            {warning}
          </Notice>
        ))}
        {reverse.status !== 'none' && (
          <Notice
            tone={
              reverse.status === 'ok'
                ? 'success'
                : reverse.status === 'already-reached'
                  ? 'info'
                  : 'danger'
            }
          >
            {reverse.status === 'ok'
              ? `${reverse.itemName} 需要 ${formatScore(reverse.requiredScore)} 分。`
              : reverse.message}
          </Notice>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {course.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"
          >
            <span className="font-medium text-slate-700">{item.name || '未命名项'}</span>
            <span className="text-slate-500">
              {formatNumber(item.weight, 1)}% ·{' '}
              {item.score === undefined ? '未填写' : `${formatScore(item.score)} 分`}
              {item.isPending ? ' · 待反推' : ''}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  )
}
