import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Tracks the Supabase auth session: reads any persisted session on load and
// subscribes to auth-state changes so the UI updates on login/logout.
// Session persistence across reloads is Supabase's default behaviour.
export function useAuth() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  return { user, ready }
}
