// Domain constants and scoring helpers for the risk register.

export const CATEGORIES = [
  'Strategic',
  'Operational',
  'Financial',
  'Compliance/Legal',
  'Hazard/Physical',
  'Reputational',
  'Cyber/Technology',
  'Environmental/Climate',
]

export const STATUSES = ['Open', 'Mitigating', 'Closed']

// 1-5 rating scale used for likelihood and impact.
export const SCALE = [1, 2, 3, 4, 5]

// Inherent score is likelihood x impact (range 1-25).
export function inherentScore(likelihood, impact) {
  return (Number(likelihood) || 0) * (Number(impact) || 0)
}

// Tailwind classes that colour a score badge by severity.
export function scoreBadgeClass(score) {
  if (score >= 15) return 'bg-red-100 text-red-700'
  if (score >= 10) return 'bg-orange-100 text-orange-700'
  if (score >= 5) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

// Tailwind classes that colour a status badge.
export function statusBadgeClass(status) {
  switch (status) {
    case 'Open':
      return 'bg-rose-100 text-rose-700'
    case 'Mitigating':
      return 'bg-amber-100 text-amber-700'
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}
