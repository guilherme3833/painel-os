import { BADGE_PALETTES, hashString } from '../constants'

export default function Badge({ status }) {
  if (!status) return null
  const p = BADGE_PALETTES[hashString(status) % BADGE_PALETTES.length]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${p.bg} ${p.text} ${p.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {status}
    </span>
  )
}
