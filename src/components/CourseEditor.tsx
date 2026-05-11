import { Plus, Trash2 } from 'lucide-react'
import { courseKindLabels, courseKindOptions, getCourseKind } from '../lib/courseKind'
import { createGradeItem } from '../lib/defaults'
import { formatNumber, formatScore } from '../lib/format'
import { calculateCourse } from '../lib/grade'
import type { Course, CourseKind, GpaRule, GradeItem } from '../types/grade'
import {
  Button,
  Notice,
  NumberInput,
  SegmentedControl,
  StepperNumberInput,
  TextInput,
} from './ui'

type CourseEditorProps = {
  course?: Course
  gpaRules: GpaRule[]
  onChange: (course: Course) => void
  onAddCourse: () => void
}

function clampOptional(value: number | undefined, min: number, max: number) {
  if (value === undefined) {
    return undefined
  }

  return Math.min(max, Math.max(min, value))
}

function calculateContribution(item: GradeItem) {
  if (item.score === undefined || Number.isNaN(item.score)) {
    return undefined
  }

  return (item.score * item.weight) / 100
}

export function CourseEditor({
  course,
  gpaRules,
  onChange,
  onAddCourse,
}: CourseEditorProps) {
  if (!course) {
    return (
      <section className="dashboard-panel dashboard-panel--editor p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="panel-kicker">课程详情</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">还没有课程</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            添加一门课程后，就可以录入成绩构成、填写目标总评，并在右侧查看 GPA 与反推结果。
          </p>
          <Button className="mt-6" variant="primary" icon={Plus} onClick={onAddCourse}>
            添加课程
          </Button>
        </div>
      </section>
    )
  }

  const calculation = calculateCourse(course, gpaRules)
  const kind = getCourseKind(course.kind)

  const updateItem = (nextItem: GradeItem) => {
    onChange({
      ...course,
      items: course.items.map((item) => (item.id === nextItem.id ? nextItem : item)),
    })
  }

  const deleteItem = (itemId: string) => {
    onChange({
      ...course,
      items: course.items.filter((item) => item.id !== itemId),
    })
  }

  return (
    <section className="dashboard-panel dashboard-panel--editor overflow-hidden">
      <div className="panel-header border-b border-[var(--section-editor-border)]">
        <div>
          <div className="panel-kicker">当前编辑</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {course.name || '未命名课程'}
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-1 text-sm font-semibold text-brand-700">
            <span className="inline-block size-2 rounded-full bg-brand-500" />
            {courseKindLabels[kind]}
          </div>
        </div>
        <Button variant="soft" size="sm" icon={Plus} onClick={onAddCourse}>
          新建课程
        </Button>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.3fr)_minmax(220px,1fr)_120px_180px]">
          <TextInput
            label="课程名称"
            value={course.name}
            onChange={(name) => onChange({ ...course, name })}
          />
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">课程类型</span>
            <SegmentedControl<CourseKind>
              value={kind}
              options={courseKindOptions.map((option) => ({
                value: option,
                label: courseKindLabels[option],
              }))}
              onChange={(nextKind) => onChange({ ...course, kind: nextKind })}
            />
          </div>
          <StepperNumberInput
            label="学分"
            min={0}
            max={20}
            step={1}
            value={course.credits}
            onChange={(credits) =>
              onChange({ ...course, credits: clampOptional(credits, 0, 20) ?? 0 })
            }
          />
          <NumberInput
            label="目标总评（百分制）"
            min={0}
            max={100}
            step={1}
            value={course.targetScore}
            placeholder="可留空"
            onChange={(targetScore) =>
              onChange({
                ...course,
                targetScore: clampOptional(targetScore, 0, 100),
              })
            }
          />
        </div>

        {calculation.warnings.map((warning) => (
          <Notice
            key={warning}
            tone={calculation.weightStatus === 'over' ? 'danger' : 'warning'}
          >
            {warning}
          </Notice>
        ))}

        <div className="overflow-hidden rounded-[24px] border border-[rgba(189,230,212,0.8)] bg-white/52">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(189,230,212,0.72)] bg-white/42 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">成绩构成</h3>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                权重合计到 100% 后，课程才会进入总 GPA 统计；若只留一个待反推项目，可结合目标总评反算所需分数。
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() =>
                onChange({
                  ...course,
                  items: [...course.items, createGradeItem('新项目', 0)],
                })
              }
            >
              添加项目
            </Button>
          </div>

          <div>
            <div className="hidden grid-cols-[minmax(140px,1fr)_150px_150px_96px_92px_40px] gap-3 border-b border-slate-100 bg-white/66 px-4 py-3 text-sm font-semibold text-slate-600 md:grid">
              <span>项目</span>
              <span>权重 (%)</span>
              <span>已得分</span>
              <span>贡献分</span>
              <span>反推</span>
              <span />
            </div>

            {course.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-b border-slate-100/90 px-4 py-4 last:border-b-0 md:grid-cols-[minmax(140px,1fr)_150px_150px_96px_92px_40px] md:items-center md:gap-3"
              >
                <div className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
                    项目
                  </span>
                  <TextInput
                    value={item.name}
                    placeholder="例如期末"
                    onChange={(name) => updateItem({ ...item, name })}
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
                    权重
                  </span>
                  <StepperNumberInput
                    min={0}
                    max={100}
                    step={5}
                    suffix="%"
                    value={item.weight}
                    onChange={(weight) =>
                      updateItem({
                        ...item,
                        weight: clampOptional(weight, 0, 100) ?? 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
                    已得分
                  </span>
                  <StepperNumberInput
                    min={0}
                    max={100}
                    step={1}
                    suffix="分"
                    value={item.score}
                    onChange={(score) =>
                      updateItem({
                        ...item,
                        score: clampOptional(score, 0, 100),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
                    贡献分
                  </span>
                  <span className="rounded-2xl bg-[rgba(231,244,255,0.86)] px-3 py-3 text-center font-semibold text-brand-700">
                    {formatScore(calculateContribution(item))}
                  </span>
                </div>
                <div className="flex items-center gap-3 md:block">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={Boolean(item.isPending)}
                      onChange={(event) =>
                        updateItem({ ...item, isPending: event.target.checked })
                      }
                      className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    待反推
                  </label>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="删除项目"
                    onClick={() => deleteItem(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(189,230,212,0.72)] bg-white/42 px-4 py-4 text-sm">
            <span className="font-semibold text-slate-700">
              权重合计：
              <span
                className={
                  calculation.weightStatus === 'complete'
                    ? 'text-emerald-600'
                    : calculation.weightStatus === 'over'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                }
              >
                {' '}
                {formatNumber(calculation.weightTotal, 1)}%
              </span>
            </span>
            <span className="font-semibold text-brand-700">
              已得贡献分：{formatScore(calculation.knownContribution)} / 100
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
