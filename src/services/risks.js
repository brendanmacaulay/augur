import { supabase } from '../lib/supabaseClient'

const TABLE = 'risks'

// Fetch every risk, newest first.
export async function listRisks() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Insert a new risk and return the created row.
export async function createRisk(risk) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(risk)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update an existing risk by id and return the updated row.
export async function updateRisk(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a risk by id.
export async function deleteRisk(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
