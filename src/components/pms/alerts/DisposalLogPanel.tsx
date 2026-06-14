import type { AlertRecord } from '@/models/pms/operations'

export function DisposalLogPanel({ entries }: { entries: AlertRecord['DisposalLog'] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.At).getTime() - new Date(b.At).getTime(),
  )

  return (
    <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
      {sorted.map((entry, i) => (
        <div key={`${entry.At}-${i}`} className="relative border-l-2 border-border pl-4">
          <p className="text-xs text-muted-foreground">
            {new Date(entry.At).toLocaleString()} · {entry.Actor}
          </p>
          <p className="text-sm font-medium">{entry.Action}</p>
          <p className="text-sm text-muted-foreground">{entry.Detail}</p>
        </div>
      ))}
    </div>
  )
}
