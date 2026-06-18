import { useCallback, useEffect, useState } from 'react'
import RiskForm from './components/RiskForm'
import RiskList from './components/RiskList'
import RiskHeatMap from './components/RiskHeatMap'
import SummaryStrip from './components/SummaryStrip'
import ExposureToggle from './components/ExposureToggle'
import DraftWithAI from './components/DraftWithAI'
import ThemeToggle from './components/ThemeToggle'
import RegisterToolbar from './components/RegisterToolbar'
import {
  CATEGORIES,
  STATUSES,
  EXPOSURE,
  exposurePosition,
  exposureScore,
  scoreBand,
} from './constants/risks'
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

const DEFAULT_REGISTER_FILTERS = {
  category: 'All',
  status: 'All',
  band: 'All',
  sort: 'newest',
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
  const [aiRationale, setAiRationale] = useState('')
  const [registerFilters, setRegisterFilters] = useState(DEFAULT_REGISTER_FILTERS)
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
    setAiRationale('')
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Prefill the form from an AI draft as a new (create-flow) risk. Residual
  // fields are left blank for the user to set after reviewing the controls.
  function handleDraft(draft) {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      title: draft.title ?? '',
      description: draft.description ?? '',
      category: CATEGORIES.includes(draft.category) ? draft.category : EMPTY_FORM.category,
      likelihood: draft.likelihood ?? EMPTY_FORM.likelihood,
      impact: draft.impact ?? EMPTY_FORM.impact,
      mitigation: Array.isArray(draft.mitigations) ? draft.mitigations.join('\n') : '',
    })
    setAiRationale(draft.rationale ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  function handleFilterChange(key, value) {
    setRegisterFilters((prev) => ({ ...prev, [key]: value }))
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
    setAiRationale('')
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

  // The register reflects the heat-map cell filter plus the toolbar filters,
  // all keyed to the active exposure for the severity dimension.
  let visibleRisks = risks
  if (selectedCell) {
    visibleRisks = visibleRisks.filter((r) => {
      const pos = exposurePosition(r, exposure)
      return (
        pos.likelihood === selectedCell.likelihood &&
        pos.impact === selectedCell.impact
      )
    })
  }
  if (registerFilters.category !== 'All') {
    visibleRisks = visibleRisks.filter((r) => r.category === registerFilters.category)
  }
  if (registerFilters.status !== 'All') {
    visibleRisks = visibleRisks.filter((r) => r.status === registerFilters.status)
  }
  if (registerFilters.band !== 'All') {
    visibleRisks = visibleRisks.filter(
      (r) => scoreBand(exposureScore(r, exposure)).name === registerFilters.band
    )
  }
  if (registerFilters.sort === 'severity-desc' || registerFilters.sort === 'severity-asc') {
    const dir = registerFilters.sort === 'severity-desc' ? -1 : 1
    visibleRisks = [...visibleRisks].sort(
      (a, b) => dir * (exposureScore(a, exposure) - exposureScore(b, exposure))
    )
  }

  const toolbarActive =
    registerFilters.category !== 'All' ||
    registerFilters.status !== 'All' ||
    registerFilters.band !== 'All' ||
    registerFilters.sort !== 'newest'
  const narrowed = selectedCell != null || visibleRisks.length !== risks.length

  const cardClass =
    'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Augur
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              An AI-native enterprise risk register — surface, score, and track exposure.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Dashboard: live severity summary + heat map */}
        <section className="mb-8 space-y-6">
          <SummaryStrip risks={risks} exposure={exposure} />

          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
                  Risk heat map
                </h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
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
        <section className={`mb-8 ${cardClass} p-6`}>
          <DraftWithAI onDraft={handleDraft} />
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-neutral-100">
            {editingId ? 'Edit risk' : 'Add a risk'}
          </h2>
          <RiskForm
            form={form}
            editingId={editingId}
            saving={saving}
            rationale={aiRationale}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </section>

        {/* Register */}
        <section className={cardClass}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
              Risk register
            </h2>
            <span className="text-sm text-slate-500 dark:text-neutral-400">
              {narrowed
                ? `${visibleRisks.length} of ${risks.length}`
                : `${risks.length} ${risks.length === 1 ? 'risk' : 'risks'}`}
            </span>
          </div>

          <RegisterToolbar
            category={registerFilters.category}
            status={registerFilters.status}
            band={registerFilters.band}
            sort={registerFilters.sort}
            onChange={handleFilterChange}
            onReset={() => setRegisterFilters(DEFAULT_REGISTER_FILTERS)}
            filtersActive={toolbarActive}
          />

          {selectedCell && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-indigo-50 px-6 py-3 text-sm dark:border-neutral-800 dark:bg-indigo-950/40">
              <span className="text-slate-700 dark:text-neutral-300">
                Showing <span className="font-semibold">{visibleRisks.length}</span>{' '}
                {visibleRisks.length === 1 ? 'risk' : 'risks'} at Likelihood{' '}
                <span className="font-semibold">{selectedCell.likelihood}</span> ×
                Impact <span className="font-semibold">{selectedCell.impact}</span>{' '}
                · {exposure} exposure
              </span>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
              selectedCell || toolbarActive
                ? 'No risks match the current filters.'
                : 'No risks yet. Add your first one above.'
            }
          />
        </section>
      </div>
    </div>
  )
}

export default App
