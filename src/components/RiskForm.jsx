import { CATEGORIES, STATUSES, SCALE } from '../constants/risks'

const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function RiskForm({
  form,
  editingId,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) {
  const set = (e) => onChange(e.target.name, e.target.value)
  const isEditing = Boolean(editingId)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={set}
          placeholder="Short risk name"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={set}
          placeholder="What is the risk and what could happen?"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={set}
            className={fieldClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={set}
            className={fieldClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="likelihood" className={labelClass}>
            Likelihood (1–5)
          </label>
          <select
            id="likelihood"
            name="likelihood"
            value={form.likelihood}
            onChange={set}
            className={fieldClass}
          >
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="impact" className={labelClass}>
            Impact (1–5)
          </label>
          <select
            id="impact"
            name="impact"
            value={form.impact}
            onChange={set}
            className={fieldClass}
          >
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="residual_likelihood" className={labelClass}>
            Residual likelihood (optional)
          </label>
          <select
            id="residual_likelihood"
            name="residual_likelihood"
            value={form.residual_likelihood}
            onChange={set}
            className={fieldClass}
          >
            <option value="">—</option>
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="residual_impact" className={labelClass}>
            Residual impact (optional)
          </label>
          <select
            id="residual_impact"
            name="residual_impact"
            value={form.residual_impact}
            onChange={set}
            className={fieldClass}
          >
            <option value="">—</option>
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mitigation" className={labelClass}>
          Mitigation
        </label>
        <textarea
          id="mitigation"
          name="mitigation"
          rows={3}
          value={form.mitigation}
          onChange={set}
          placeholder="Controls or actions to reduce the risk"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="owner" className={labelClass}>
          Owner
        </label>
        <input
          id="owner"
          name="owner"
          type="text"
          value={form.owner}
          onChange={set}
          placeholder="Person or team accountable"
          className={fieldClass}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEditing ? 'Update risk' : 'Add risk'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel edit
          </button>
        )}
      </div>
    </form>
  )
}
