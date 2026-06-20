import {
  EXPOSURE,
  inherentScore,
  exposureScore,
  scoreBadgeClass,
  statusBadgeClass,
} from '../constants/risks'

// A coloured severity-score badge, shared by the inherent and residual columns.
function ScoreBadge({ score }) {
  return (
    <span
      className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(
        score
      )}`}
    >
      {score}
    </span>
  )
}

// Shows how exposure changed from inherent to residual after controls.
function ExposureDelta({ inherent, residual }) {
  const delta = residual - inherent
  if (delta === 0) {
    return (
      <span
        className="text-[11px] text-slate-400 dark:text-neutral-500"
        title="Residual equals inherent — no control effect"
      >
        no change
      </span>
    )
  }
  const dropped = delta < 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        dropped
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400'
      }`}
      title={
        dropped
          ? `Exposure dropped ${Math.abs(delta)} after controls`
          : `Exposure rose ${delta} versus inherent`
      }
    >
      {dropped ? '▼' : '▲'} {Math.abs(delta)}
    </span>
  )
}

const actionButtonClass =
  'rounded-md border px-2.5 py-1 text-xs font-medium transition'

export default function RiskList({
  risks,
  loading,
  editingId,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No risks yet. Add your first one above.',
}) {
  if (loading) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-neutral-400">
        Loading risks…
      </p>
    )
  }

  if (risks.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-neutral-400">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-neutral-800">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-neutral-800/50 dark:text-neutral-400">
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">I</th>
            <th className="px-4 py-3 text-center">Inherent</th>
            <th className="px-4 py-3 text-center">Residual</th>
            <th className="px-4 py-3">Status</th>
            {canManage && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
          {risks.map((risk) => {
            const inherent = inherentScore(risk.likelihood, risk.impact)
            const residual = exposureScore(risk, EXPOSURE.RESIDUAL)
            const isEditing = risk.id === editingId
            return (
              <tr
                key={risk.id}
                className={
                  isEditing
                    ? 'bg-indigo-50 dark:bg-indigo-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                }
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-neutral-100">
                    {risk.title}
                  </div>
                  {risk.owner && (
                    <div className="text-xs text-slate-500 dark:text-neutral-400">
                      Owner: {risk.owner}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-neutral-300">
                  {risk.category}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 dark:text-neutral-300">
                  {risk.likelihood}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 dark:text-neutral-300">
                  {risk.impact}
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={inherent} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <ScoreBadge score={residual} />
                    <ExposureDelta inherent={inherent} residual={residual} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                      risk.status
                    )}`}
                  >
                    {risk.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(risk)}
                        className={`${actionButtonClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(risk)}
                        className={`${actionButtonClass} border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-neutral-800 dark:text-rose-400 dark:hover:bg-rose-950/40`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
