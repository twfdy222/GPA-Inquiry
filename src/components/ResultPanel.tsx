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
    <article className={`rounded-lg border p-4 ${tone}`}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {title}
        <Info className="size-4 text-slate-400" aria-hidden="true" />
      </div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-bold leading-none">{value}</span>
        {suffix && <span className="pb-1 text-sm font-semibold">{suffix}</span>}
      </div>
      <div className="mt-2 text-sm text-slate-600">{note}</div>
    </article>
  )
}

function getReverseNote(calculation: CourseCalculation | undefined) {
  if (!calculation || calculation.reverse.status === 'none') {
    return '可根据目标反推所需分数'
  }

  if (calculation.reverse.status === 'ok') {
    return `${calculation.reverse.itemName} 需要 ${formatScore(
      calculation.reverse.requiredScore,
    )} 分`
  }

  return calculation.reverse.message ?? '请检查目标总评和待反推项目'
}

export function ResultPanel({
  course,
  calculation,
  onCopy,
  onDelete,
}: ResultPanelProps) {
  if (!course || !calculation) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="text-base font-semibold text-slate-950">结果摘要</div>
        <p className="mt-2 text-sm text-slate-500">添加课程后会在这里显示计算结果。</p>
      </aside>
    )
  }

  return (
    <aside className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap justify-end gap-2 border-b border-slate-100 pb-3">
        <Button variant="secondary" size="sm" icon={Copy} onClick={onCopy}>
          复制课程
        </Button>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}>
          删除课程
        </Button>
      </div>

      <ResultCard
        title="当前已知贡献分"
        value={formatScore(calculation.knownContribution)}
        suffix="/ 100"
        note="基于已录入成绩计算"
        tone="border-blue-100 bg-blue-50 text-blue-700"
      />
      <ResultCard
        title="预计总评（百分制）"
        value={formatScore(calculation.projectedScore)}
        suffix="分"
        note="按当前权重计算"
        tone="border-emerald-100 bg-emerald-50 text-emerald-700"
      />
      <ResultCard
        title="目标总评（百分制）"
        value={formatScore(course.targetScore)}
        suffix="分"
        note={getReverseNote(calculation)}
        tone="border-orange-100 bg-orange-50 text-orange-700"
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
