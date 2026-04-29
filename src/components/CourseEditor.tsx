import type { Course, GradeItem } from '../types/grade'
import { createGradeItem } from '../lib/defaults'
import { calculateCourse } from '../lib/grade'
import type { GpaRule } from '../types/grade'
import { formatNumber } from '../lib/format'
import { Button, Notice, NumberInput, Panel, TextInput } from './ui'
import { GradeItemEditor } from './GradeItemEditor'

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

export function CourseEditor({
  course,
  gpaRules,
  onChange,
  onAddCourse,
}: CourseEditorProps) {
  if (!course) {
    return (
      <Panel title="课程编辑">
        <div className="grid gap-4 text-center">
          <p className="text-sm text-slate-500">还没有课程，先添加一门课开始模拟。</p>
          <Button variant="primary" onClick={onAddCourse}>
            添加课程
          </Button>
        </div>
      </Panel>
    )
  }

  const calculation = calculateCourse(course, gpaRules)

  const updateItem = (nextItem: GradeItem) => {
    onChange({
      ...course,
      items: course.items.map((item) =>
        item.id === nextItem.id ? nextItem : item,
      ),
    })
  }

  return (
    <Panel
      title="课程编辑"
      action={
        <Button variant="primary" onClick={onAddCourse}>
          添加课程
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label="课程名"
            value={course.name}
            onChange={(name) => onChange({ ...course, name })}
          />
          <NumberInput
            label="学分"
            min={0}
            max={20}
            value={course.credits}
            onChange={(credits) =>
              onChange({ ...course, credits: clampOptional(credits, 0, 20) ?? 0 })
            }
          />
          <NumberInput
            label="目标总评"
            min={0}
            max={100}
            value={course.targetScore}
            placeholder="可留空"
            onChange={(targetScore) =>
              onChange({
                ...course,
                targetScore: clampOptional(targetScore, 0, 100),
              })
            }
          />
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-sm text-slate-500">占比合计</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">
              {formatNumber(calculation.weightTotal, 1)}%
            </div>
          </div>
        </div>

        {calculation.warnings.map((warning) => (
          <Notice
            key={warning}
            tone={calculation.weightStatus === 'over' ? 'danger' : 'warning'}
          >
            {warning}
          </Notice>
        ))}

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">成绩组成部分</h3>
            <Button
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
          {course.items.map((item) => (
            <GradeItemEditor
              key={item.id}
              item={item}
              onChange={updateItem}
              onDelete={() =>
                onChange({
                  ...course,
                  items: course.items.filter((current) => current.id !== item.id),
                })
              }
            />
          ))}
        </div>
      </div>
    </Panel>
  )
}
