import { inherentScore, scoreBadgeClass, statusBadgeClass } from '../constants/risks'

export default function RiskList({ risks, loading, editingId, onEdit, onDelete }) {
  if (loading) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500">
        Loading risks…
      </p>
    )
  }

  if (risks.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500">
        No risks yet. Add your first one above.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">I</th>
            <th className="px-4 py-3 text-center">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {risks.map((risk) => {
            const score = inherentScore(risk.likelihood, risk.impact)
            const isEditing = risk.id === editingId
            return (
              <tr
                key={risk.id}
                className={isEditing ? 'bg-indigo-50' : 'hover:bg-slate-50'}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{risk.title}</div>
                  {risk.owner && (
                    <div className="text-xs text-slate-500">Owner: {risk.owner}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{risk.category}</td>
                <td className="px-4 py-3 text-center text-slate-700">
                  {risk.likelihood}
                </td>
                <td className="px-4 py-3 text-center text-slate-700">
                  {risk.impact}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(
                      score
                    )}`}
                  >
                    {score}
                  </span>
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
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(risk)}
                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(risk)}
                      className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
