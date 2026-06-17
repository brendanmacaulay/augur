import { EXPOSURES } from '../constants/risks'

// Segmented control switching the dashboard between Inherent and Residual
// exposure.
export default function ExposureToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Exposure mode"
      className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1"
    >
      {EXPOSURES.map((mode) => {
        const active = mode === value
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {mode}
          </button>
        )
      })}
    </div>
  )
}
