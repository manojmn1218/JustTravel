import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { preference, setPreference, resolvedTheme } = useTheme()

  const label =
    preference === 'system'
      ? `Theme: System (${resolvedTheme})`
      : `Theme: ${preference[0].toUpperCase()}${preference.slice(1)}`

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only" id="theme-label">
        {label}
      </span>
      <select
        aria-labelledby="theme-label"
        value={preference}
        onChange={(e) => setPreference(e.target.value as typeof preference)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-offset-slate-950"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
