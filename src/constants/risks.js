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

// Axis labels for the heat map.
export const LIKELIHOOD_LABELS = {
  1: 'Rare',
  2: 'Unlikely',
  3: 'Possible',
  4: 'Likely',
  5: 'Almost certain',
}

export const IMPACT_LABELS = {
  1: 'Negligible',
  2: 'Minor',
  3: 'Moderate',
  4: 'Major',
  5: 'Catastrophic',
}

// Exposure modes for the dashboard. Inherent uses a risk's raw likelihood
// and impact; Residual uses the residual_* fields, falling back to the
// inherent value per-axis when controls have not been assessed yet.
export const EXPOSURE = { INHERENT: 'Inherent', RESIDUAL: 'Residual' }
export const EXPOSURES = [EXPOSURE.INHERENT, EXPOSURE.RESIDUAL]

// Inherent score is likelihood x impact (range 1-25).
export function inherentScore(likelihood, impact) {
  return (Number(likelihood) || 0) * (Number(impact) || 0)
}

// The (likelihood, impact) a risk occupies in the given exposure mode.
// Residual falls back to the inherent value on each axis when unset, i.e.
// "no controls assessed yet, so residual equals inherent".
export function exposurePosition(risk, mode) {
  if (mode === EXPOSURE.RESIDUAL) {
    return {
      likelihood: risk.residual_likelihood ?? risk.likelihood,
      impact: risk.residual_impact ?? risk.impact,
    }
  }
  return { likelihood: risk.likelihood, impact: risk.impact }
}

// Severity score (likelihood x impact) for a risk in the given exposure mode,
// reusing the shared inherentScore so both modes score identically.
export function exposureScore(risk, mode) {
  const { likelihood, impact } = exposurePosition(risk, mode)
  return inherentScore(likelihood, impact)
}

// Severity bands, ordered highest-first. Each band carries the Tailwind
// tokens used across the heat map cells, summary cards, and legend so the
// colour scheme stays consistent in one place.
//   - cell:       filled heat-map cell (medium shade, dark readable text)
//   - swatch:     small solid square for the legend
//   - card:       summary-card border + background
//   - accentText: summary-card count colour
export const BANDS = [
  {
    name: 'Critical',
    range: '15–25',
    min: 15,
    cell: 'bg-red-400 text-red-950 dark:bg-red-600 dark:text-red-50',
    swatch: 'bg-red-400 dark:bg-red-600',
    card: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/50',
    accentText: 'text-red-700 dark:text-red-300',
  },
  {
    name: 'High',
    range: '10–14',
    min: 10,
    cell: 'bg-orange-300 text-orange-950 dark:bg-orange-600 dark:text-orange-50',
    swatch: 'bg-orange-300 dark:bg-orange-600',
    card: 'border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/50',
    accentText: 'text-orange-700 dark:text-orange-300',
  },
  {
    name: 'Moderate',
    range: '5–9',
    min: 5,
    cell: 'bg-amber-200 text-amber-950 dark:bg-amber-500 dark:text-amber-950',
    swatch: 'bg-amber-200 dark:bg-amber-500',
    card: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/50',
    accentText: 'text-amber-700 dark:text-amber-300',
  },
  {
    name: 'Low',
    range: '1–4',
    min: 1,
    cell: 'bg-emerald-200 text-emerald-950 dark:bg-emerald-600 dark:text-emerald-50',
    swatch: 'bg-emerald-200 dark:bg-emerald-600',
    card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/50',
    accentText: 'text-emerald-700 dark:text-emerald-300',
  },
]

// Resolve a score (1-25) to its severity band.
export function scoreBand(score) {
  return BANDS.find((band) => score >= band.min) ?? BANDS[BANDS.length - 1]
}

// Tailwind classes that colour a small score badge by severity (used in the
// register table — lighter than the solid heat-map cells).
export function scoreBadgeClass(score) {
  if (score >= 15) return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  if (score >= 10)
    return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
  if (score >= 5)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
}

// Tailwind classes that colour a status badge.
export function statusBadgeClass(status) {
  switch (status) {
    case 'Open':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
    case 'Mitigating':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300'
  }
}
