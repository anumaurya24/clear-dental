import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const body = await readBody(event)
  const { title, details } = body

  const { error } = await supabase.from('entries').insert({
    title,
    details,
    user_id: user.id,       // <<< IMPORTANT
  })

  if (error) {
    console.error('insert entries error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit entry.',
    })
  }

  return { ok: true }
})
