import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? (
        <span className="text-sm text-rose-700 dark:text-rose-200">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  )
}

const baseInputClass =
  'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ' +
  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-offset-slate-950'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[baseInputClass, props.className ?? ''].join(' ')} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[baseInputClass, 'min-h-24 resize-y', props.className ?? ''].join(' ')}
    />
  )
}
