import { useState, type ButtonHTMLAttributes, type PropsWithChildren, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'soft'
type ButtonSize = 'sm' | 'md' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  children?: ReactNode
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-brand-600 bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus:ring-brand-200',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-brand-200 hover:bg-brand-50 focus:ring-brand-100',
  danger:
    'border border-rose-600 bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus:ring-rose-200',
  ghost:
    'border border-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-100',
  soft:
    'border border-brand-100 bg-brand-50 text-brand-700 hover:border-brand-200 hover:bg-brand-100 focus:ring-brand-100',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-2 rounded-md px-3 text-sm',
  md: 'min-h-10 gap-2 rounded-md px-4 text-sm',
  icon: 'size-10 rounded-md p-0',
}

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ')
}

export function Button({
  type = 'button',
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        'inline-flex items-center justify-center font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50',
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4" aria-hidden="true" />}
      {children}
    </button>
  )
}

type TextInputProps = {
  label?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
}

export function TextInput({
  label,
  value,
  placeholder,
  onChange,
  className,
}: TextInputProps) {
  const input = (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={mergeClassNames(
        'h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
        className,
      )}
    />
  )

  if (!label) {
    return input
  }

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {input}
    </label>
  )
}

type NumberInputProps = {
  label?: string
  value: number | undefined
  min?: number
  max?: number
  step?: number
  displayDigits?: number
  placeholder?: string
  onChange: (value: number | undefined) => void
  className?: string
}

function clamp(value: number, min?: number, max?: number) {
  let nextValue = value

  if (min !== undefined) {
    nextValue = Math.max(min, nextValue)
  }

  if (max !== undefined) {
    nextValue = Math.min(max, nextValue)
  }

  return nextValue
}

function getInputValue(
  value: number | undefined,
  isFocused: boolean,
  displayDigits?: number,
) {
  if (value === undefined) {
    return ''
  }

  if (!isFocused && displayDigits !== undefined) {
    return value.toFixed(displayDigits)
  }

  return String(value)
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 0.1,
  displayDigits,
  placeholder,
  onChange,
  className,
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const input = (
    <input
      type="number"
      value={getInputValue(value, isFocused, displayDigits)}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(event) => {
        if (event.target.value === '') {
          onChange(undefined)
          return
        }

        const nextValue = Number(event.target.value)
        onChange(Number.isFinite(nextValue) ? clamp(nextValue, min, max) : undefined)
      }}
      className={mergeClassNames(
        'h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
        className,
      )}
    />
  )

  if (!label) {
    return input
  }

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {input}
    </label>
  )
}

type StepperNumberInputProps = NumberInputProps & {
  suffix?: string
}

export function StepperNumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  ...props
}: StepperNumberInputProps) {
  const updateBy = (delta: number) => {
    const baseValue = value ?? 0
    onChange(clamp(baseValue + delta, min, max))
  }

  return (
    <div className="inline-grid gap-1.5 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <button
          type="button"
          onClick={() => updateBy(-step)}
          className="flex size-10 items-center justify-center border-r border-slate-100 text-lg font-semibold text-slate-500 transition hover:bg-slate-50"
          aria-label="减少"
        >
          -
        </button>
        <NumberInput
          {...props}
          label={undefined}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          className="h-10 w-16 rounded-none border-0 px-2 text-center focus:ring-0"
        />
        {suffix && <span className="px-2 text-sm text-slate-500">{suffix}</span>}
        <button
          type="button"
          onClick={() => updateBy(step)}
          className="flex size-10 items-center justify-center border-l border-slate-100 text-lg font-semibold text-slate-500 transition hover:bg-slate-50"
          aria-label="增加"
        >
          +
        </button>
      </div>
    </div>
  )
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={mergeClassNames(
            'whitespace-nowrap rounded px-3 py-1.5 text-sm font-semibold transition',
            option.value === value
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

type NoticeTone = 'info' | 'warning' | 'danger' | 'success'

const noticeStyles: Record<NoticeTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export function Notice({
  tone = 'info',
  children,
}: PropsWithChildren<{ tone?: NoticeTone }>) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${noticeStyles[tone]}`}>
      {children}
    </div>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
}: PropsWithChildren<{ title?: string; action?: ReactNode; className?: string }>) {
  return (
    <section
      className={mergeClassNames(
        'rounded-lg border border-slate-200 bg-white shadow-soft',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}
