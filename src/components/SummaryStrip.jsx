import { BANDS, EXPOSURE, exposureScore, scoreBand } from '../constants/risks'

// Four cards counting risks per severity band (Critical → Low), based on the
// active exposure's score. Recomputes from props, so it stays live.
export default function SummaryStrip({ risks, exposure = EXPOSURE.INHERENT }) {
  const counts = Object.fromEntries(BANDS.map((band) => [band.name, 0]))
  for (const risk of risks) {
    const band = scoreBand(exposureScore(risk, exposure))
    counts[band.name] += 1
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {BANDS.map((band) => (
        <div key={band.name} className={`rounded-xl border p-4 ${band.card}`}>
          <div className={`text-3xl font-bold ${band.accentText}`}>
            {counts[band.name]}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-neutral-200">
            {band.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            Score {band.range}
          </div>
        </div>
      ))}
    </div>
  )
}
