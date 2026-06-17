import { useCallback, useEffect, useState } from 'react'
import RiskForm from './components/RiskForm'
import RiskList from './components/RiskList'
import { CATEGORIES, STATUSES } from './constants/risks'
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

        <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Risk register</h2>
            <span className="text-sm text-slate-500">
              {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
            </span>
          </div>
          <RiskList
            risks={risks}
            loading={loading}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </div>
  )
}

export default App
