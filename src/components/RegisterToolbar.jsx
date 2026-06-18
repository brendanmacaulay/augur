import { CATEGORIES, STATUSES, BANDS } from '../constants/risks'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'severity-desc', label: 'Severity (high → low)' },
  { value: 'severity-asc', label: 'Severity (low → high)' },
]

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
const labelClass =
  'text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

// Filter + sort controls for the register, keyed off the active exposure for
// the severity dimension (handled by the parent).
export default function RegisterToolbar({
  category,
  status,
  band,
  sort,
  onChange,
  onReset,
  filtersActive,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
      <Field label="Category">
        <select
          value={category}
          onChange={(e) => onChange('category', e.target.value)}
          className={selectClass}
        >
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Status">
        <select
          value={status}
          onChange={(e) => onChange('status', e.target.value)}
          className={selectClass}
        >
          <option value="All">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Severity">
        <select
          value={band}
          onChange={(e) => onChange('band', e.target.value)}
          className={selectClass}
        >
          <option value="All">All</option>
          {BANDS.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sort">
        <select
          value={sort}
          onChange={(e) => onChange('sort', e.target.value)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {filtersActive && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Reset filters
        </button>
      )}
    </div>
  )
}
