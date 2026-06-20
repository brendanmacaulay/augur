import { supabase } from '../lib/supabaseClient'

// Email/password sign-in. Throws on failure so callers can surface a
// (deliberately generic) error message.
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
