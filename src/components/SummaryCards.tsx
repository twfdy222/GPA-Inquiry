import { BarChart3, BookOpenText, Layers3, Percent } from 'lucide-react'
import { formatGpa, formatScore } from '../lib/format'
import type { SummaryStats } from '../types/grade'

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
      note: '基于已完成课程的加权绩点',
      icon: BarChart3,
      panel: 'bg-[linear-gradient(180deg,rgba(234,244,255,0.96),rgba(255,255,255,0.92))] border-[rgba(189,215,245,0.9)]',
      badge: 'from-[#dcedff] to-white text-[#1f67cd]',
    },
    {
      label: '加权均分',
      value: formatScore(summary.weightedAverage),
      note: '百分制课程成绩加权平均',
      icon: Percent,
      panel: 'bg-[linear-gradient(180deg,rgba(235,251,244,0.96),rgba(255,255,255,0.92))] border-[rgba(191,233,214,0.92)]',
      badge: 'from-[#ddf9ee] to-white text-[#177d59]',
    },
    {
      label: '计划学分',
      value: formatCompactNumber(summary.plannedCredits),
      note: '当前视图内已录入课程学分',
      icon: BookOpenText,
      panel: 'bg-[linear-gradient(180deg,rgba(255,246,233,0.96),rgba(255,255,255,0.92))] border-[rgba(246,219,191,0.92)]',
      badge: 'from-[#ffedd6] to-white text-[#b96c18]',
    },
    {
      label: '课程数量',
      value: String(summary.courseCount),
      note: `其中完整课程 ${summary.completeCourseCount} 门`,
      icon: Layers3,
      panel: 'bg-[linear-gradient(180deg,rgba(244,239,255,0.96),rgba(255,255,255,0.92))] border-[rgba(220,207,247,0.92)]',
      badge: 'from-[#e7dcff] to-white text-[#7452c7]',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article key={card.label} className={`dashboard-panel border p-5 ${card.panel}`}>
            <div className="flex items-start gap-4">
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${card.badge} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]`}
              >
                <Icon className="size-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {card.label}
                </div>
                <div className="mt-3 text-[2rem] font-semibold leading-none text-slate-950">
                  {card.value}
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-500">{card.note}</div>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
