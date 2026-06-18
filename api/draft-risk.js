// Vercel serverless function: drafts a structured risk-register entry from a
// plain-English description by calling the Anthropic Messages API.
//
// The Anthropic API key is read from process.env.ANTHROPIC_API_KEY and never
// leaves the server — the browser only ever talks to this endpoint.
import { CATEGORIES } from '../src/constants/risks.js'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5'
const MAX_TOKENS = 1024
const DEFAULT_CATEGORY = 'Operational'

// Built from the shared category list so there is a single source of truth.
const SYSTEM_PROMPT = `You are an enterprise risk management (ERM) analyst. Given a plain-English description of a risk, produce a structured risk-register entry.

Return ONLY a JSON object — no preamble, no commentary, and no markdown code fences. The object must have exactly these keys:
- "title": a concise risk statement
- "description": 2 to 3 sentences describing the risk and its potential consequences
- "category": exactly one of: ${CATEGORIES.join(', ')}
- "likelihood": an integer from 1 to 5
- "impact": an integer from 1 to 5
- "rationale": one sentence explaining the likelihood and impact scores
- "mitigations": an array of 3 to 4 short control suggestions

Score conservatively and realistically. Output the JSON object and nothing else.`

// Coerce a value to an integer clamped to the 1-5 scale (defaults to 3).
function clampScore(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 3
  return Math.min(5, Math.max(1, n))
}

// Strip a leading/trailing markdown code fence if the model wrapped its JSON.
function stripCodeFences(text) {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1].trim() : trimmed
}

// Read and JSON-parse the request body, tolerating both the pre-parsed
// req.body (Vercel) and a raw stream (local `vercel dev`).
async function readJsonBody(req) {
  if (req.body != null) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'The drafting service is not configured (missing API key).' })
    return
  }

  let text
  try {
    const body = await readJsonBody(req)
    text = typeof body?.text === 'string' ? body.text.trim() : ''
  } catch {
    res.status(400).json({ error: 'Invalid request body — expected JSON { text }.' })
    return
  }

  if (!text) {
    res.status(400).json({ error: 'Provide a "text" description of the risk.' })
    return
  }

  // Call the Anthropic Messages API.
  let apiResponse
  try {
    apiResponse = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })
  } catch {
    res.status(502).json({ error: 'Could not reach the AI service. Please try again.' })
    return
  }

  if (!apiResponse.ok) {
    let detail = ''
    try {
      const errBody = await apiResponse.json()
      detail = errBody?.error?.message ? ` ${errBody.error.message}` : ''
    } catch {
      // Non-JSON error body — ignore.
    }
    res.status(502).json({ error: `AI service error (${apiResponse.status}).${detail}` })
    return
  }

  // Extract the model's text output.
  let modelText
  try {
    const data = await apiResponse.json()
    modelText = (data.content ?? [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()
  } catch {
    res.status(502).json({ error: 'Unexpected response from the AI service.' })
    return
  }

  if (!modelText) {
    res.status(502).json({ error: 'The AI service returned an empty response.' })
    return
  }

  // Parse the JSON the model produced.
  let draft
  try {
    draft = JSON.parse(stripCodeFences(modelText))
  } catch {
    res.status(502).json({ error: 'Could not parse the AI response. Please try again.' })
    return
  }

  // Validate and normalise before returning to the client.
  const mitigations = Array.isArray(draft.mitigations)
    ? draft.mitigations.filter((m) => typeof m === 'string' && m.trim()).map((m) => m.trim())
    : []

  res.status(200).json({
    title: typeof draft.title === 'string' ? draft.title.trim() : '',
    description: typeof draft.description === 'string' ? draft.description.trim() : '',
    category: CATEGORIES.includes(draft.category) ? draft.category : DEFAULT_CATEGORY,
    likelihood: clampScore(draft.likelihood),
    impact: clampScore(draft.impact),
    rationale: typeof draft.rationale === 'string' ? draft.rationale.trim() : '',
    mitigations,
  })
}
