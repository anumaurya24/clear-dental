// server/api/users.patch.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface UpdateUserBody {
  userId: string      // profiles.user_id
  role?: 'basic' | 'admin'
  banned?: boolean
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<UpdateUserBody>(event)

  if (!body?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'userId required' })
  }

  // check current user is admin and not banned
  const { data: me, error: meError } = await client
    .from('profiles')
    .select('role, banned')
    .eq('user_id', user.id)
    .single()

  if (meError) {
    console.error(meError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to load profile' })
  }

  if (me.banned) {
    throw createError({ statusCode: 403, statusMessage: 'User is banned' })
  }

  if (me.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }

  const update: Record<string, any> = {}
  if (body.role) update.role = body.role
  if (typeof body.banned === 'boolean') update.banned = body.banned

  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const { error } = await client
    .from('profiles')
    .update(update)
    .eq('user_id', body.userId)

  if (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
  }

  return { ok: true }
})
