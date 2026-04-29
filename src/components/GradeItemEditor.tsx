import type { GradeItem } from '../types/grade'
import { Button, NumberInput, TextInput } from './ui'

type GradeItemEditorProps = {
  item: GradeItem
  onChange: (item: GradeItem) => void
  onDelete: () => void
}

function clampOptional(value: number | undefined, min: number, max: number) {
  if (value === undefined) {
    return undefined
  }

  return Math.min(max, Math.max(min, value))
}

export function GradeItemEditor({
  item,
  onChange,
  onDelete,
}: GradeItemEditorProps) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <TextInput
          label="项目名称"
          value={item.name}
          placeholder="例如期末"
          onChange={(name) => onChange({ ...item, name })}
        />
        <NumberInput
          label="占比 %"
          min={0}
          max={100}
          value={item.weight}
          onChange={(weight) =>
            onChange({ ...item, weight: clampOptional(weight, 0, 100) ?? 0 })
          }
        />
        <NumberInput
          label="分数"
          min={0}
          max={100}
          value={item.score}
          placeholder="可留空"
          onChange={(score) =>
            onChange({ ...item, score: clampOptional(score, 0, 100) })
          }
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(item.isPending)}
            onChange={(event) =>
              onChange({ ...item, isPending: event.target.checked })
            }
            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          设为待反推项目
        </label>
        <Button variant="ghost" onClick={onDelete}>
          删除项目
        </Button>
      </div>
    </div>
  )
}
