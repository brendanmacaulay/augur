import {
  BANDS,
  SCALE,
  EXPOSURE,
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
  inherentScore,
  exposurePosition,
  scoreBand,
} from '../constants/risks'

// Impact runs highest at the top, so rows go 5 → 1.
const IMPACTS_TOP_DOWN = [...SCALE].reverse()

// Legend reads low → critical for a natural severity ramp.
const LEGEND = [...BANDS].reverse()

export default function RiskHeatMap({
  risks,
  exposure = EXPOSURE.INHERENT,
  selectedCell,
  onSelectCell,
}) {
  // Tally how many risks sit in each cell, by their position in the active
  // exposure mode (residual falls back to inherent per-axis).
  const counts = {}
  for (const risk of risks) {
    const { likelihood, impact } = exposurePosition(risk, exposure)
    counts[`${likelihood}-${impact}`] = (counts[`${likelihood}-${impact}`] ?? 0) + 1
  }

  const isSelected = (likelihood, impact) =>
    selectedCell != null &&
    selectedCell.likelihood === likelihood &&
    selectedCell.impact === impact

  return (
    <div>
      <div className="flex">
        {/* Y-axis title */}
        <div className="flex w-6 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">
            Impact
          </span>
        </div>

        <div className="flex-1">
          {/* Matrix rows, top (impact 5) to bottom (impact 1) */}
          {IMPACTS_TOP_DOWN.map((impact) => (
            <div key={impact} className="flex items-stretch">
              <div className="flex w-24 shrink-0 flex-col justify-center pr-2 text-right sm:w-28">
                <span className="text-sm font-semibold text-slate-700">
                  {impact}
                </span>
                <span className="text-[11px] leading-tight text-slate-500">
                  {IMPACT_LABELS[impact]}
                </span>
              </div>

              {SCALE.map((likelihood) => {
                const score = inherentScore(likelihood, impact)
                const band = scoreBand(score)
                const count = counts[`${likelihood}-${impact}`] ?? 0
                const selected = isSelected(likelihood, impact)
                return (
                  <button
                    key={likelihood}
                    type="button"
                    onClick={() => onSelectCell(likelihood, impact)}
                    aria-pressed={selected}
                    title={`Likelihood ${likelihood} × Impact ${impact} — score ${score} (${band.name})${
                      count ? `, ${count} risk${count === 1 ? '' : 's'}` : ''
                    }`}
                    className={`relative m-0.5 flex h-16 flex-1 items-center justify-center rounded-md transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 sm:h-20 ${
                      band.cell
                    } ${selected ? 'ring-2 ring-inset ring-slate-900' : ''}`}
                  >
                    {count > 0 && (
                      <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-white/85 px-2 text-sm font-bold text-slate-900 shadow-sm">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          {/* X-axis labels */}
          <div className="flex">
            <div className="w-24 shrink-0 sm:w-28" />
            {SCALE.map((likelihood) => (
              <div
                key={likelihood}
                className="m-0.5 flex flex-1 flex-col items-center text-center"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {likelihood}
                </span>
                <span className="text-[11px] leading-tight text-slate-500">
                  {LIKELIHOOD_LABELS[likelihood]}
                </span>
              </div>
            ))}
          </div>

          {/* X-axis title */}
          <div className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Likelihood
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {LEGEND.map((band) => (
          <div key={band.name} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded ${band.swatch}`} />
            <span className="text-sm text-slate-700">
              <span className="font-medium">{band.name}</span>{' '}
              <span className="text-slate-400">({band.range})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
