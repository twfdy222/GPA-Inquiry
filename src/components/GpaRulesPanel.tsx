import { ChevronDown, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { createId, defaultGpaRules } from '../lib/defaults'
import { formatGpa } from '../lib/format'
import { validateGpaRules } from '../lib/grade'
import type { GpaRule } from '../types/grade'
import { Button, Notice, NumberInput } from './ui'

type GpaRulesPanelProps = {
  rules: GpaRule[]
  isOpen: boolean
  onToggle: () => void
  onChange: (rules: GpaRule[]) => void
}

function clamp(value: number | undefined, min: number, max: number) {
  return Math.min(max, Math.max(min, value ?? min))
}

export function GpaRulesPanel({
  rules,
  isOpen,
  onToggle,
  onChange,
}: GpaRulesPanelProps) {
  const validation = validateGpaRules(rules)

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            GPA
          </span>
          <span>
            <span className="block text-base font-semibold text-slate-950">
              GPA 计算规则
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              当前采用：<span className="font-semibold text-brand-700">4.33 制</span>
              {' / '}可自定义绩点规则
            </span>
          </span>
        </span>
        <ChevronDown
          className={`size-5 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="grid gap-4 border-t border-slate-100 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-3xl text-sm text-slate-500">
              规则按四舍五入后的最终成绩匹配，判断方式为 min &lt;= 分数 &lt; max，最高档可包含 100 分。
              绩点始终保留两位小数显示，例如 {formatGpa(4)}。
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                icon={Plus}
                onClick={() =>
                  onChange([
                    ...rules,
                    { id: createId('rule'), min: 0, max: 100, point: 0 },
                  ])
                }
              >
                添加规则
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={RotateCcw}
                onClick={() => {
                  if (window.confirm('确定恢复默认 GPA 规则吗？当前自定义规则会被覆盖。')) {
                    onChange(defaultGpaRules.map((rule) => ({ ...rule })))
                  }
                }}
              >
                恢复默认
              </Button>
            </div>
          </div>

          {validation.warnings.map((warning) => (
            <Notice key={warning} tone="danger">
              {warning}
            </Notice>
          ))}
          {validation.gaps.length > 0 && (
            <Notice tone="warning">未覆盖区间：{validation.gaps.join('、')}</Notice>
          )}
          {validation.overlaps.length > 0 && (
            <Notice tone="danger">重叠区间：{validation.overlaps.join('、')}</Notice>
          )}

          <div className="grid gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <NumberInput
                  label="下限"
                  min={0}
                  max={100}
                  step={1}
                  value={rule.min}
                  onChange={(min) =>
                    onChange(
                      rules.map((current) =>
                        current.id === rule.id
                          ? { ...current, min: clamp(min, 0, 100) }
                          : current,
                      ),
                    )
                  }
                />
                <NumberInput
                  label="上限"
                  min={0}
                  max={100}
                  step={1}
                  value={rule.max}
                  onChange={(max) =>
                    onChange(
                      rules.map((current) =>
                        current.id === rule.id
                          ? { ...current, max: clamp(max, 0, 100) }
                          : current,
                      ),
                    )
                  }
                />
                <NumberInput
                  label="绩点"
                  min={0}
                  max={5}
                  step={0.01}
                  displayDigits={2}
                  value={rule.point}
                  onChange={(point) =>
                    onChange(
                      rules.map((current) =>
                        current.id === rule.id
                          ? { ...current, point: clamp(point, 0, 5) }
                          : current,
                      ),
                    )
                  }
                />
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="删除规则"
                    onClick={() =>
                      onChange(rules.filter((current) => current.id !== rule.id))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
