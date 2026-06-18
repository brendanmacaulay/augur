import { useState } from 'react'

// Plain-English → structured draft panel. Calls the /api/draft-risk serverless
// function and hands the validated draft back to the parent to prefill the form.
export default function DraftWithAI({ onDraft }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDraft() {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Describe the risk first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/draft-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      if (!res.ok) {
        let message = 'Could not draft the risk. Please try again.'
        try {
          const data = await res.json()
          if (data?.error) message = data.error
        } catch {
          // Non-JSON error response — keep the default message.
        }
        setError(message)
        return
      }
      const draft = await res.json()
      onDraft(draft)
    } catch {
      setError('Could not reach the drafting service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Draft with AI
        </h3>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
          Beta
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Describe a risk in plain English and let AI draft the entry.{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Review and edit before saving.
        </span>
      </p>

      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Our main payment provider could suffer an outage during peak sales, blocking customer checkout."
        className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="mt-3">
        <button
          type="button"
          onClick={handleDraft}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Drafting…' : 'Draft with AI'}
        </button>
      </div>
    </div>
  )
}
