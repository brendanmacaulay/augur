function SparkleIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
      />
    </svg>
  )
}

// Read-only context callout shown only to logged-out visitors, explaining the
// app (and its otherwise-hidden AI feature) and that read-only is intentional.
export default function VisitorBanner() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
      <SparkleIcon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
          You&rsquo;re viewing Augur in read-only mode.
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">
          Augur is an AI-native enterprise risk register. Describe a risk in
          plain English and its built-in AI assistant drafts a structured,
          scored entry with suggested controls. Sign in as an admin to use the
          AI assistant and to add, edit, or delete risks.
        </p>
      </div>
    </div>
  )
}
