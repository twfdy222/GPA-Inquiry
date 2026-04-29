import type { GpaRule } from '../types/grade'
import { createId, defaultGpaRules } from '../lib/defaults'
import { validateGpaRules } from '../lib/grade'
import { Button, Notice, NumberInput, Panel } from './ui'

type GpaRulesPanelProps = {
  rules: GpaRule[]
  onChange: (rules: GpaRule[]) => void
}

function clamp(value: number | undefined, min: number, max: number) {
  return Math.min(max, Math.max(min, value ?? min))
}

export function GpaRulesPanel({ rules, onChange }: GpaRulesPanelProps) {
  const validation = validateGpaRules(rules)

  return (
    <Panel
      title="GPA 规则表"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
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
            variant="danger"
            onClick={() => {
              if (window.confirm('确定恢复默认 GPA 规则吗？当前自定义规则会被覆盖。')) {
                onChange(defaultGpaRules.map((rule) => ({ ...rule })))
              }
            }}
          >
            恢复默认规则
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <p className="text-sm text-slate-500">
          规则按四舍五入后的最终成绩匹配，判断方式为 min ≤ 分数 &lt; max，最高档可包含 100 分。
        </p>

        {validation.warnings.map((warning) => (
          <Notice key={warning} tone="danger">
            {warning}
          </Notice>
        ))}
        {validation.gaps.length > 0 && (
          <Notice tone="warning">
            未覆盖区间：{validation.gaps.join('、')}
          </Notice>
        )}
        {validation.overlaps.length > 0 && (
          <Notice tone="danger">
            重叠区间：{validation.overlaps.join('、')}
          </Notice>
        )}

        <div className="grid gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <NumberInput
                label="下限"
                min={0}
                max={100}
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
                  onClick={() =>
                    onChange(rules.filter((current) => current.id !== rule.id))
                  }
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
