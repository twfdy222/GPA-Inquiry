import { BarChart3, BookOpenText, Layers3, Percent } from 'lucide-react'
import type { SummaryStats } from '../types/grade'
import { formatGpa, formatScore } from '../lib/format'

type SummaryCardsProps = {
  summary: SummaryStats
}

function formatCompactNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return '--'
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: '总 GPA',
      value: formatGpa(summary.totalGpa),
      note: '基于完整课程计算',
      icon: BarChart3,
      tone: 'text-blue-600 bg-blue-50',
    },
    {
      label: '加权均分',
      value: formatScore(summary.weightedAverage),
      note: '百分制加权平均分',
      icon: Percent,
      tone: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: '总学分',
      value: formatCompactNumber(summary.plannedCredits),
      note: '已修 / 计划学分总数',
      icon: BookOpenText,
      tone: 'text-violet-600 bg-violet-50',
    },
    {
      label: '课程数',
      value: String(summary.courseCount),
      note: `完整课程 ${summary.completeCourseCount} 门`,
      icon: Layers3,
      tone: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
              >
                <Icon className="size-7" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">{card.label}</div>
                <div className="mt-1 text-3xl font-bold leading-none text-slate-950">
                  {card.value}
                </div>
                <div className="mt-2 text-sm text-slate-500">{card.note}</div>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
