import { AlertTriangle, BarChart3, PieChart } from 'lucide-react'
import { courseKindLabels } from '../lib/courseKind'
import { formatGpa, formatNumber, formatScore } from '../lib/format'
import type { RiskCourse, SemesterSummary } from '../types/grade'

type AnalyticsPanelProps = {
  semesterSummaries: SemesterSummary[]
  creditDistribution: {
    required: number
    major: number
    elective: number
    total: number
  }
  riskCourses: RiskCourse[]
}

function widthPercent(value: number, total: number) {
  if (total <= 0) {
    return '0%'
  }

  return `${Math.max(4, (value / total) * 100)}%`
}

export function AnalyticsPanel({
  semesterSummaries,
  creditDistribution,
  riskCourses,
}: AnalyticsPanelProps) {
  const latestSummary = semesterSummaries.at(-1)
  const previousSummary = semesterSummaries.at(-2)
  const gpaDelta =
    latestSummary?.totalGpa !== undefined && previousSummary?.totalGpa !== undefined
      ? latestSummary.totalGpa - previousSummary.totalGpa
      : undefined

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:col-span-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-brand-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">学期趋势</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {latestSummary
            ? `最近学期 ${latestSummary.semesterName} 的 GPA 为 ${formatGpa(
                latestSummary.totalGpa,
              )}，均分 ${formatScore(latestSummary.weightedAverage)}。`
            : '创建学期并录入完整课程后，这里会显示趋势。'}
        </p>
        <div className="mt-4 grid gap-3">
          {semesterSummaries.length === 0 ? (
            <div className="rounded-md bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
              暂无趋势数据
            </div>
          ) : (
            semesterSummaries.map((summary) => (
              <div key={summary.semesterId} className="grid gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {summary.semesterName}
                  </span>
                  <span className="text-slate-500">
                    GPA {formatGpa(summary.totalGpa)} · 均分{' '}
                    {formatScore(summary.weightedAverage)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{
                      width:
                        summary.totalGpa === undefined
                          ? '0%'
                          : `${Math.min(100, (summary.totalGpa / 4.33) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {gpaDelta !== undefined && (
          <p className="mt-3 text-sm text-slate-500">
            较上一学期 {gpaDelta >= 0 ? '上升' : '下降'} {Math.abs(gpaDelta).toFixed(2)}。
          </p>
        )}
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <PieChart className="size-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">学分构成</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          当前视图合计 {formatNumber(creditDistribution.total, 1)} 学分。
        </p>
        <div className="mt-4 grid gap-3">
          {(['required', 'major', 'elective'] as const).map((kind) => (
            <div key={kind} className="grid gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  {courseKindLabels[kind]}
                </span>
                <span className="text-slate-500">
                  {formatNumber(creditDistribution[kind], 1)} 学分
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={
                    kind === 'required'
                      ? 'h-full rounded-full bg-blue-500'
                      : kind === 'major'
                        ? 'h-full rounded-full bg-violet-500'
                        : 'h-full rounded-full bg-emerald-500'
                  }
                  style={{
                    width: widthPercent(
                      creditDistribution[kind],
                      creditDistribution.total,
                    ),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:col-span-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">风险课程</h2>
        </div>
        <div className="mt-3 grid gap-2">
          {riskCourses.length === 0 ? (
            <div className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              当前视图没有发现风险课程。
            </div>
          ) : (
            riskCourses.slice(0, 5).map(({ course, reasons }) => (
              <div
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-slate-800">{course.name}</span>
                <span className="text-amber-700">{reasons.join('；')}</span>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  )
}
