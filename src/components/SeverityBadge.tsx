import type { Severity } from '../types/database'

const STYLES: Record<Severity, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

export default function SeverityBadge({ severity }: { severity: Severity | null }) {
  if (!severity) return <span className="text-slate-400">—</span>
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[severity]}`}>
      {severity}
    </span>
  )
}
