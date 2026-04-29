import type { SummaryStats } from '../types/grade'
import { formatNumber } from '../lib/format'

type SummaryCardsProps = {
  summary: SummaryStats
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    { label: '总 GPA', value: formatNumber(summary.totalGpa, 2) },
    { label: '加权平均分', value: formatNumber(summary.weightedAverage, 2) },
    { label: '总学分', value: formatNumber(summary.totalCredits, 1) },
    { label: '课程数', value: String(summary.courseCount) },
    { label: '完整课程数', value: String(summary.completeCourseCount) },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
        >
          <div className="text-sm text-slate-500">{card.label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {card.value}
          </div>
        </div>
      ))}
    </section>
  )
}
