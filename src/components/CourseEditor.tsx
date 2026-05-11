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
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto max-w-sm">
          <h2 className="text-lg font-semibold text-slate-950">还没有课程</h2>
          <p className="mt-2 text-sm text-slate-500">
            添加一门课程后，就可以填写成绩组成、模拟目标总评，并计算 GPA。
          </p>
          <Button className="mt-5" variant="primary" icon={Plus} onClick={onAddCourse}>
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
      items: course.items.map((item) =>
        item.id === nextItem.id ? nextItem : item,
      ),
    })
  }

  const deleteItem = (itemId: string) => {
    onChange({
      ...course,
      items: course.items.filter((item) => item.id !== itemId),
    })
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-950">
            课程详情 / {course.name || '未命名课程'}
          </h2>
          <span className="rounded-md bg-brand-50 px-2 py-1 text-sm font-semibold text-brand-700">
            {courseKindLabels[kind]}
          </span>
        </div>
        <Button variant="soft" size="sm" icon={Plus} onClick={onAddCourse}>
          添加课程
        </Button>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(180px,1fr)_auto_auto_minmax(160px,220px)]">
          <TextInput
            label="课程名称"
            value={course.name}
            onChange={(name) => onChange({ ...course, name })}
          />
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">课程类型</span>
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

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">成绩构成</h3>
              <p className="mt-1 text-xs text-slate-500">
                权重合计为 100% 时，课程才会进入总 GPA 统计。
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
            <div className="hidden grid-cols-[minmax(120px,1fr)_130px_130px_90px_72px_36px] gap-2 border-b border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 md:grid">
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
                className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[minmax(120px,1fr)_130px_130px_90px_72px_36px] md:items-center md:gap-2 md:py-3"
              >
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 md:hidden">
                    项目
                  </span>
                  <TextInput
                    value={item.name}
                    placeholder="例如期末"
                    onChange={(name) => updateItem({ ...item, name })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 md:hidden">
                    权重 (%)
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
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 md:hidden">
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
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 md:hidden">
                    贡献分
                  </span>
                  <span className="font-semibold text-brand-600">
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="font-semibold text-slate-700">
              权重合计：{' '}
              <span
                className={
                  calculation.weightStatus === 'complete'
                    ? 'text-emerald-600'
                    : calculation.weightStatus === 'over'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                }
              >
                {formatNumber(calculation.weightTotal, 1)}%
              </span>
            </span>
            <span className="font-semibold text-brand-600">
              已得贡献分合计：{formatScore(calculation.knownContribution)} / 100
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
