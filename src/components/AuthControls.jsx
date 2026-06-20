import { useState } from 'react'
import { signIn, signOut } from '../services/auth'

const labelClass =
  'block text-sm font-medium text-slate-700 mb-1 dark:text-neutral-300'
const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ' +
  'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100'

// Header auth affordance: an "Admin sign in" link that opens a login modal
// when logged out, or the signed-in email + Sign out when logged in.
export default function AuthControls({ user }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
      // onAuthStateChange flips the UI to admin mode; just tidy up here.
      setOpen(false)
      setEmail('')
      setPassword('')
    } catch {
      // Generic message — never reveal whether the email exists.
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // onAuthStateChange will reconcile the UI regardless.
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 dark:text-neutral-400 sm:inline">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('')
          setOpen(true)
        }}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        Admin sign in
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
                Admin sign in
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label htmlFor="admin-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
