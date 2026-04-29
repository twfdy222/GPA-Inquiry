import type { PropsWithChildren, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = {
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-200',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 focus:ring-brand-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-100',
}

export function Button({
  type = 'button',
  variant = 'secondary',
  onClick,
  disabled,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]}`}
    >
      {children}
    </button>
  )
}

type TextInputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function TextInput({ label, value, placeholder, onChange }: TextInputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  )
}

type NumberInputProps = {
  label: string
  value: number | undefined
  min?: number
  max?: number
  step?: number
  placeholder?: string
  onChange: (value: number | undefined) => void
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 0.1,
  placeholder,
  onChange,
}: NumberInputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(event) => {
          if (event.target.value === '') {
            onChange(undefined)
            return
          }

          const nextValue = Number(event.target.value)
          onChange(Number.isFinite(nextValue) ? nextValue : undefined)
        }}
        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
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
}: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}
