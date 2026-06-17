import { useCallback, useEffect, useState } from 'react'
import RiskForm from './components/RiskForm'
import RiskList from './components/RiskList'
import RiskHeatMap from './components/RiskHeatMap'
import SummaryStrip from './components/SummaryStrip'
import ExposureToggle from './components/ExposureToggle'
import { CATEGORIES, STATUSES, EXPOSURE, exposurePosition } from './constants/risks'
import { listRisks, createRisk, updateRisk, deleteRisk } from './services/risks'

const EMPTY_FORM = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  likelihood: 3,
  impact: 3,
  residual_likelihood: '',
  residual_impact: '',
  mitigation: '',
  owner: '',
  status: STATUSES[0],
}

// Convert empty residual selections to null and coerce numeric fields.
function toPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    likelihood: Number(form.likelihood),
    impact: Number(form.impact),
    residual_likelihood:
      form.residual_likelihood === '' ? null : Number(form.residual_likelihood),
    residual_impact:
      form.residual_impact === '' ? null : Number(form.residual_impact),
    mitigation: form.mitigation.trim(),
    owner: form.owner.trim(),
    status: form.status,
  }
}

function App() {
  const [risks, setRisks] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [exposure, setExposure] = useState(EXPOSURE.INHERENT)
  const [selectedCell, setSelectedCell] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await listRisks()
      setRisks(data)
      setError('')
    } catch (e) {
      setError(e.message ?? 'Failed to load risks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listRisks()
        if (active) {
          setRisks(data)
          setError('')
        }
      } catch (e) {
        if (active) setError(e.message ?? 'Failed to load risks.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Toggle the heat-map cell filter; clicking the active cell clears it.
  function handleSelectCell(likelihood, impact) {
    setSelectedCell((prev) =>
      prev && prev.likelihood === likelihood && prev.impact === impact
        ? null
        : { likelihood, impact }
    )
  }

  // Switching exposure repaints the matrix, so any cell filter is cleared.
  function handleExposureChange(mode) {
    setExposure(mode)
    setSelectedCell(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = toPayload(form)
      if (editingId) {
        await updateRisk(editingId, {
          ...payload,
          updated_at: new Date().toISOString(),
        })
      } else {
        await createRisk(payload)
      }
      resetForm()
      await refresh()
    } catch (e) {
      setError(e.message ?? 'Failed to save risk.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(risk) {
    setEditingId(risk.id)
    setForm({
      title: risk.title ?? '',
      description: risk.description ?? '',
      category: risk.category ?? CATEGORIES[0],
      likelihood: risk.likelihood ?? 3,
      impact: risk.impact ?? 3,
      residual_likelihood: risk.residual_likelihood ?? '',
      residual_impact: risk.residual_impact ?? '',
      mitigation: risk.mitigation ?? '',
      owner: risk.owner ?? '',
      status: risk.status ?? STATUSES[0],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(risk) {
    if (!window.confirm(`Delete risk "${risk.title}"? This cannot be undone.`)) {
      return
    }
    setError('')
    try {
      await deleteRisk(risk.id)
      if (editingId === risk.id) resetForm()
      await refresh()
    } catch (e) {
      setError(e.message ?? 'Failed to delete risk.')
    }
  }

  // The register reflects the active heat-map cell filter, if any, matching
  // each risk by its position in the active exposure mode.
  const visibleRisks = selectedCell
    ? risks.filter((r) => {
        const pos = exposurePosition(r, exposure)
        return (
          pos.likelihood === selectedCell.likelihood &&
          pos.impact === selectedCell.impact
        )
      })
    : risks

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Augur</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-native enterprise risk register
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Dashboard: live severity summary + heat map */}
        <section className="mb-8 space-y-6">
          <SummaryStrip risks={risks} exposure={exposure} />

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Risk heat map</h2>
                <p className="text-sm text-slate-500">
                  {exposure} exposure · likelihood × impact
                </p>
              </div>
              <ExposureToggle value={exposure} onChange={handleExposureChange} />
            </div>
            <RiskHeatMap
              risks={risks}
              exposure={exposure}
              selectedCell={selectedCell}
              onSelectCell={handleSelectCell}
            />
          </div>
        </section>

        {/* Add / edit form */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? 'Edit risk' : 'Add a risk'}
          </h2>
          <RiskForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </section>

        {/* Register */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Risk register</h2>
            <span className="text-sm text-slate-500">
              {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
            </span>
          </div>

          {selectedCell && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-indigo-50 px-6 py-3 text-sm">
              <span className="text-slate-700">
                Showing <span className="font-semibold">{visibleRisks.length}</span>{' '}
                {visibleRisks.length === 1 ? 'risk' : 'risks'} at Likelihood{' '}
                <span className="font-semibold">{selectedCell.likelihood}</span> ×
                Impact <span className="font-semibold">{selectedCell.impact}</span>{' '}
                · {exposure} exposure
              </span>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          )}

          <RiskList
            risks={visibleRisks}
            loading={loading}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage={
              selectedCell
                ? 'No risks in this cell.'
                : 'No risks yet. Add your first one above.'
            }
          />
        </section>
      </div>
    </div>
  )
}

export default App
