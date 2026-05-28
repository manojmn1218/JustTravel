export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <span className="size-2 animate-pulse rounded-full bg-indigo-500" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}
