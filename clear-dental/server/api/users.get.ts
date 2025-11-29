// server/api/users.get.ts
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { getQuery } from "h3"

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    })
  }

  const query = getQuery(event)

  /* ------------------------------------------------------------------
   * 1) CURRENT USER PROFILE  →  GET /api/users?self=true
   * ------------------------------------------------------------------ */
  if (query.self === "true") {
    try {
      // 1a. Try to find an existing profile row for this auth user
      const { data: existing, error: selectError } = await supabase
        .from("profiles")
        .select("id, user_id, email, role, banned, created_at")
        .eq("user_id", user.id)   // ✅ matches your schema
        .maybeSingle()

      if (selectError) {
        console.error("profiles self select error:", selectError)
      }

      if (existing) {
        return existing
      }

      // 1b. If no row, create a default BASIC profile
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          email: user.email ?? null,
          role: "basic",
          banned: false,
        })
        .select("id, user_id, email, role, banned, created_at")
        .single()

      if (insertError) {
        console.error("profiles self insert error:", insertError)
      } else if (created) {
        return created
      }
    } catch (e) {
      console.error("profiles self unexpected error:", e)
    }

    // 1c. Fallback – never completely break Header
    return {
      id: null,
      user_id: user.id,
      email: user.email ?? null,
      role: "basic",
      banned: false,
      created_at: new Date().toISOString(),
    }
  }

  /* ------------------------------------------------------------------
   * 2) ADMIN ONLY: LIST ALL PROFILES  →  GET /api/users
   * ------------------------------------------------------------------ */

  // First check THIS user’s role
  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (meError) {
    console.error("profiles admin check error:", meError)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to check admin role",
    })
  }

  if (!me || me.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admin can view users",
    })
  }

  // Admin: return all profiles for /users page
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, role, banned, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("profiles list error:", error)
      return []
    }

    return data ?? []
  } catch (e) {
    console.error("profiles list unexpected error:", e)
    return []
  }
})
