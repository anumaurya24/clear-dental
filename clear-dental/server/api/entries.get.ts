// server/api/entries.get.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  // 1) Must be logged in
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  // 2) Load profile to see if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('profile error in /api/entries', profileError)
    throw createError({
      statusCode: 500,
      // 👇 show the real error from Supabase
      statusMessage: profileError.message || 'Failed to load profile',
    })
  }

  const isAdmin = profile?.role === 'admin'

  // 3) Build query for entries
  let query = supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  // non-admin sees only their own entries
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('entries error', error)

    // If RLS denies, return a helpful 403 with the DB message
    if (error.message && /permission denied/i.test(error.message)) {
      throw createError({
        statusCode: 403,
        statusMessage: error.message, // "permission denied for table entries" etc.
      })
    }

    // Otherwise bubble up the real message
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to load entries.',
    })
  }

  return data ?? []
})
