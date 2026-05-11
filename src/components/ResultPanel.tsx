import { Copy, Info, Trash2 } from 'lucide-react'
import { formatScore } from '../lib/format'
import type { Course, CourseCalculation } from '../types/grade'
import { Button, Notice } from './ui'

type ResultPanelProps = {
  course?: Course
  calculation?: CourseCalculation
  onCopy: () => void
  onDelete: () => void
}

function ResultCard({
  title,
  value,
  suffix,
  note,
  tone,
}: {
  title: string
  value: string
  suffix?: string
  note: string
  tone: string
}) {
  return (
    <article className={`rounded-[24px] border p-4 ${tone}`}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {title}
        <Info className="size-4 text-slate-400" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-semibold leading-none">{value}</span>
        {suffix && <span className="pb-1 text-sm font-semibold">{suffix}</span>}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-600">{note}</div>
    </article>
  )
}

function getReverseNote(calculation: CourseCalculation | undefined) {
  if (!calculation || calculation.reverse.status === 'none') {
    return '可根据目标总评反推单个待定项目所需分数。'
  }

  if (calculation.reverse.status === 'ok') {
    return `${calculation.reverse.itemName} 需要 ${formatScore(
      calculation.reverse.requiredScore,
    )} 分。`
  }

  return calculation.reverse.message ?? '请检查目标总评与待反推项目设置。'
}

export function ResultPanel({
  course,
  calculation,
  onCopy,
  onDelete,
}: ResultPanelProps) {
  if (!course || !calculation) {
    return (
      <aside className="dashboard-panel dashboard-panel--result p-5">
        <div className="panel-kicker">结果摘要</div>
        <div className="mt-2 text-lg font-semibold text-slate-950">等待课程数据</div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          选择或创建课程后，这里会显示已知贡献分、预计总评和目标反推结果。
        </p>
      </aside>
    )
  }

  return (
    <aside className="dashboard-panel dashboard-panel--result grid gap-4 p-4 sm:p-5">
      <div>
        <div className="panel-kicker">结果摘要</div>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{course.name || '未命名课程'}</h2>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--section-result-border)] pb-4">
        <Button variant="secondary" size="sm" icon={Copy} onClick={onCopy}>
          复制课程
        </Button>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}>
          删除课程
        </Button>
      </div>

      <ResultCard
        title="已知贡献分"
        value={formatScore(calculation.knownContribution)}
        suffix="/ 100"
        note="基于当前已录入分项成绩计算。"
        tone="border-blue-100 bg-blue-50/92 text-blue-700"
      />
      <ResultCard
        title="预计总评"
        value={formatScore(calculation.projectedScore)}
        suffix="分"
        note="权重完整后显示当前课程的预计百分制总评。"
        tone="border-emerald-100 bg-emerald-50/92 text-emerald-700"
      />
      <ResultCard
        title="目标反推"
        value={formatScore(course.targetScore)}
        suffix="分"
        note={getReverseNote(calculation)}
        tone="border-orange-100 bg-orange-50/92 text-orange-700"
      />

      {calculation.reverse.status !== 'none' && calculation.reverse.status !== 'ok' && (
        <Notice
          tone={
            calculation.reverse.status === 'already-reached' ? 'info' : 'warning'
          }
        >
          {calculation.reverse.message}
        </Notice>
      )}
    </aside>
  )
}
